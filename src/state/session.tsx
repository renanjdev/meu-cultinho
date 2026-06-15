/**
 * state/session.tsx — real auth/session backed by Supabase.
 *
 * The login is by "usuário"; Supabase Auth is by e-mail, so we map
 * usuario -> usuario@meucultinho.app. The profile (name/role) comes from the
 * `auxiliares` table. Role: 'cooperador' (master/líder) | 'auxiliar'.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase, usernameToEmail } from '../services/supabase';

export type Role = 'cooperador' | 'auxiliar';

export interface Session {
  userId: string;
  name: string;
  username: string;
  role: Role;
  photoUrl: string;
}

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  /** Throws on invalid credentials; the auth listener sets the session. */
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Recarrega o perfil do usuário logado (ex.: após trocar a foto). */
  refresh: () => Promise<void>;
  /** Autocadastro de auxiliar via link: valida o código, cria conta + perfil. */
  signUpAuxiliar: (
    code: string,
    name: string,
    username: string,
    password: string,
  ) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function loadProfile(userId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('auxiliares')
    .select('name, username, role, photo_url')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    userId,
    name: data.name,
    username: data.username,
    role: data.role as Role,
    photoUrl: data.photo_url ?? '',
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const apply = async (userId: string | undefined) => {
      let prof: Session | null = null;
      try {
        prof = userId ? await loadProfile(userId) : null;
      } catch {
        prof = null;
      }
      if (active) {
        setSession(prof);
        setLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      void apply(sess?.user.id);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error) throw error;
    // Auth ok — load the profile. No profile row = can't enter; surface it
    // clearly instead of spinning forever.
    const prof = await loadProfile(data.user.id);
    if (!prof) {
      await supabase.auth.signOut();
      throw new Error('SEM_PERFIL');
    }
    setSession(prof);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) return;
    try {
      const prof = await loadProfile(uid);
      if (prof) setSession(prof);
    } catch {
      /* mantém a sessão atual em caso de erro de rede */
    }
  }, []);

  const signUpAuxiliar = useCallback(
    async (code: string, name: string, username: string, password: string) => {
      const email = usernameToEmail(username);
      // 1) valida o código ANTES de criar a conta (evita conta órfã com código errado)
      const { data: ok, error: cErr } = await supabase.rpc('check_aux_invite', { p_code: code });
      if (cErr) throw new Error(cErr.message);
      if (!ok) throw new Error('CODIGO_INVALIDO');
      // 2) cria a conta de auth. Se o usuário já existe (ex.: tentativa anterior
      //    que falhou no perfil), entra com a mesma senha para retomar o cadastro;
      //    se a senha não bate, é de outra pessoa → usuário em uso.
      const { error: sErr } = await supabase.auth.signUp({ email, password });
      if (sErr) {
        if (/already registered|already exists|already_exists/i.test(sErr.message)) {
          const { error: inErr } = await supabase.auth.signInWithPassword({ email, password });
          if (inErr) throw new Error('USUARIO_EXISTE');
        } else {
          throw sErr;
        }
      }
      // 3) cria o perfil no servidor (revalida o código, role fixo 'auxiliar';
      //    idempotente: se já existir o perfil, apenas retorna)
      const { error: rErr } = await supabase.rpc('redeem_aux_invite', {
        p_code: code,
        p_name: name,
        p_username: username,
      });
      if (rErr) {
        await supabase.auth.signOut(); // não deixar conta logada sem perfil
        throw new Error(rErr.message);
      }
      // 4) carrega o perfil e entra. Deixa o erro propagar (ao contrário do
      //    refresh, que engole) para a tela reagir em vez de travar no spinner.
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) throw new Error('SESSAO_PERDIDA');
      const prof = await loadProfile(uid);
      if (!prof) throw new Error('PERFIL_NAO_CARREGOU');
      setSession(prof);
    },
    [],
  );

  return (
    <SessionContext.Provider
      value={{ session, loading, signIn, signOut, refresh, signUpAuxiliar }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}

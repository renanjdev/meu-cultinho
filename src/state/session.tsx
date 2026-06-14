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

  return (
    <SessionContext.Provider value={{ session, loading, signIn, signOut, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}

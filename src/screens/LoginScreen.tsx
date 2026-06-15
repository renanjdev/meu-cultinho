/** 2. Login — real auth via Supabase (usuário + senha). */
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSession } from '../state/session';
import { useToast } from '../components/Toast';
import { useNav } from '../navigation/useNav';
import { Button, Field, Link, LogoMark, Screen, Txt } from '../components/ui';
import { IconLock, IconUser } from '../components/Icons';

export default function LoginScreen() {
  const t = useTheme();
  const { signIn } = useSession();
  const { show } = useToast();
  const { go } = useNav();
  const [user, setUser] = useState('renan');
  const [pass, setPass] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  const entrar = async () => {
    if (busy) return;
    setErro('');
    setBusy(true);
    try {
      // On success the auth gate swaps to the app navigator automatically.
      await signIn(user.trim(), pass);
    } catch (e) {
      if (__DEV__ && e instanceof Error && e.message === 'SEM_PERFIL') {
        console.warn('SEM_PERFIL: usuário autenticou mas não tem linha em auxiliares.');
      }
      // mensagem neutra (não revela se o auth passou nem cita o banco)
      setErro(
        e instanceof Error && e.message === 'SEM_PERFIL'
          ? 'Não foi possível entrar. Procure o cooperador.'
          : 'Usuário ou senha inválidos.',
      );
      setBusy(false);
    }
  };

  return (
    <Screen statusBarColor={t.bg}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <LogoMark size={76} />
          <Txt weight="bold" numberOfLines={1} style={{ fontSize: 26, marginTop: 16, marginBottom: 4 }}>
            Meu Cultinho
          </Txt>
          <Txt weight="semibold" size={14} color={t.inkSoft}>
            Acesse para continuar
          </Txt>
        </View>

        <View style={{ gap: 12 }}>
          <Field
            label="Usuário"
            value={user}
            onChangeText={setUser}
            placeholder="seu.usuario"
            icon={<IconUser size={19} />}
            autoComplete="username"
            textContentType="username"
          />
          <Field
            label="Senha"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            placeholder="••••••••"
            icon={<IconLock size={19} />}
            autoComplete="current-password"
            textContentType="password"
          />
          <View style={{ alignItems: 'flex-end' }}>
            <Link onPress={() => show('Peça ao cooperador para redefinir sua senha.', 'info')}>
              Esqueci minha senha
            </Link>
          </View>
          {erro ? (
            <Txt weight="semibold" size={13} color={t.absentDeep}>
              {erro}
            </Txt>
          ) : null}
          <View style={{ height: 8 }} />
          <Button variant="primary" loading={busy} onPress={entrar}>
            Entrar
          </Button>
          <View style={{ alignItems: 'center' }}>
            <Link onPress={() => go('AuxSignup')}>Sou auxiliar: criar conta</Link>
          </View>
        </View>

        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Txt
            weight="semibold"
            size={13}
            color={t.inkSoft}
            style={{ textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
            Organize os grupos, registre presenças e acompanhe cada jovem com cuidado.
          </Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

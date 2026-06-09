/** 2. Login — signs in with Firebase; the auth gate handles routing on success. */
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { signIn } from '../services/auth';
import { seedFirestore } from '../data/seedFirestore';
import { Button, Field, LogoMark, Link, Screen, Txt } from '../components/ui';
import { IconLock, IconUser } from '../components/Icons';

type SeedState = 'idle' | 'running' | 'done' | 'error';

export default function LoginScreen() {
  const t = useTheme();
  const [user, setUser] = useState('renan.j');
  const [pass, setPass] = useState('••••••••');
  const [erro, setErro] = useState('');
  const [seedState, setSeedState] = useState<SeedState>('idle');
  const [seedMsg, setSeedMsg] = useState('');

  return (
    <Screen statusBarColor={t.bg}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <LogoMark size={76} />
          <Txt weight="bold" style={{ fontSize: 26, marginTop: 18, marginBottom: 4 }}>
            Meu Cultinho
          </Txt>
          <Txt weight="semibold" size={14} color={t.inkSoft}>
            Acesse para continuar
          </Txt>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Usuário" value={user} onChangeText={setUser} placeholder="seu.usuario" icon={<IconUser size={19} />} />
          <Field
            label="Senha"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            placeholder="••••••••"
            icon={<IconLock size={19} />}
          />
          <View style={{ alignItems: 'flex-end' }}>
            <Link>Esqueci minha senha</Link>
          </View>
          {erro ? (
            <Txt weight="semibold" size={13} color={t.absent}>
              {erro}
            </Txt>
          ) : null}
          <View style={{ height: 4 }} />
          <Button
            variant="primary"
            onPress={async () => {
              try {
                setErro('');
                await signIn(user, pass);
              } catch {
                setErro('Usuário ou senha inválidos.');
              }
            }}>
            Entrar
          </Button>
        </View>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Txt
            weight="semibold"
            size={13.5}
            color={t.inkSoft}
            style={{ textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
            Organize os grupos, registre presenças e acompanhe cada jovem com cuidado.
          </Txt>
        </View>

        {/* DEV-only helper to populate Firestore with the fictional seed data. */}
        {__DEV__ ? (
          <View style={{ marginTop: 22, alignItems: 'center', gap: 8 }}>
            <Link
              onPress={async () => {
                if (seedState === 'running') return;
                try {
                  setSeedState('running');
                  setSeedMsg('Populando...');
                  await seedFirestore('cultinho123');
                  setSeedState('done');
                  setSeedMsg('Pronto! Entre com renan.j / cultinho123');
                } catch (e) {
                  setSeedState('error');
                  setSeedMsg(e instanceof Error ? e.message : 'Falha ao popular os dados.');
                }
              }}>
              ⚙️ Popular dados de teste
            </Link>
            {seedMsg ? (
              <Txt
                weight="semibold"
                size={12.5}
                color={seedState === 'error' ? t.absent : t.inkSoft}
                style={{ textAlign: 'center', maxWidth: 300, lineHeight: 19 }}>
                {seedMsg}
              </Txt>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

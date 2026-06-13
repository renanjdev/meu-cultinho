/** 2. Login — front-end only: the two buttons navigate to a home by role. */
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useApp, useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { Button, Field, Link, LogoMark, Screen, Txt } from '../components/ui';
import { IconLock, IconUser } from '../components/Icons';
import { useToast } from '../components/Toast';

export default function LoginScreen() {
  const t = useTheme();
  const { setRole } = useApp();
  const { go } = useNav();
  const { show } = useToast();
  const [user, setUser] = useState('renan.j');
  const [pass, setPass] = useState('');

  const enter = (role: 'admin' | 'auxiliar') => {
    setRole(role);
    go(role === 'admin' ? 'AdminHome' : 'AuxHome');
  };

  return (
    <Screen statusBarColor={t.bg}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <LogoMark size={76} />
          <Txt weight="bold" numberOfLines={1} style={{ fontSize: 26, marginTop: 18, marginBottom: 4 }}>
            Meu Cultinho
          </Txt>
          <Txt weight="semibold" size={14} color={t.inkSoft}>
            Acesse para continuar
          </Txt>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Usuário" value={user} onChangeText={setUser} placeholder="seu.usuario" icon={<IconUser size={19} />} autoComplete="username" textContentType="username" />
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
            <Link onPress={() => show('Em breve')}>Esqueci minha senha</Link>
          </View>
          <View style={{ height: 4 }} />
          <Button variant="primary" onPress={() => enter('admin')}>
            Entrar
          </Button>
          <Button variant="secondary" onPress={() => enter('auxiliar')}>
            Entrar como auxiliar
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
      </ScrollView>
    </Screen>
  );
}

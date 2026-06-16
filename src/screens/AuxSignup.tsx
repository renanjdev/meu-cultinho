/**
 * Autocadastro de auxiliar (aberto pelo link de convite do cooperador).
 * Valida o código → cria a conta (o auxiliar define a própria senha) → entra.
 */
import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSession } from '../state/session';
import { useNav } from '../navigation/useNav';
import { Button, Field, FieldSection, LogoMark, Screen, Segmented, Txt } from '../components/ui';
import { IconCalendar, IconCheck, IconLock, IconUser, IconWhats } from '../components/Icons';
import { validateDateBR } from '../data/date';

/** Lê o código do link (?aux=CODIGO) no navegador. */
function readInviteFromUrl(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  try {
    return (new URLSearchParams(window.location.search).get('aux') ?? '').toUpperCase();
  } catch {
    return '';
  }
}

export default function AuxSignup() {
  const t = useTheme();
  const { signUpAuxiliar } = useSession();
  const { go } = useNav();
  const [code, setCode] = useState(readInviteFromUrl());
  const [name, setName] = useState('');
  const [user, setUser] = useState('');
  const [birth, setBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [batismo, setBatismo] = useState('');
  const [selado, setSelado] = useState(false);
  const [presented, setPresented] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [erro, setErro] = useState('');

  const codeOk = code.trim().length > 0;
  const nameOk = name.trim().length >= 2;
  // precisa começar com letra/número (evita usuários só com símbolos → e-mail interno inválido)
  const userOk = /^[a-z0-9][a-z0-9._-]{2,}$/i.test(user.trim());
  // nascimento: data válida, não no futuro (vira o aniversário no calendário)
  const birthErr = birth.trim() ? validateDateBR(birth) : 'Informe seu nascimento';
  const birthOk = !birthErr;
  // batismo e apresentação são opcionais; só validam quando preenchidos
  const batismoErr = batismo.trim() ? validateDateBR(batismo) : '';
  const presentedErr = presented.trim() ? validateDateBR(presented) : '';
  const passOk = pass.length >= 6;
  const matchOk = pass === pass2;
  const canSubmit =
    codeOk && nameOk && userOk && birthOk && !batismoErr && !presentedErr && passOk && matchOk;

  const criar = async () => {
    setTried(true);
    setErro('');
    if (!canSubmit) return;
    setBusy(true);
    try {
      await signUpAuxiliar({
        code: code.trim(),
        name: name.trim(),
        username: user.trim().toLowerCase(),
        password: pass,
        birth: birth.trim(),
        batismo: batismo.trim(),
        selado,
        presented: presented.trim(),
        phone: phone.trim(),
      });
      // sucesso: o Gate troca para o app (Home do auxiliar) automaticamente
    } catch (e: unknown) {
      const msg = String((e as { message?: string })?.message ?? e ?? '');
      setErro(
        msg.includes('CODIGO_INVALIDO')
          ? 'Código de convite inválido. Confira com o cooperador.'
          : msg.includes('USUARIO_EXISTE') || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate')
            ? 'Esse usuário já está em uso. Escolha outro.'
            : msg.includes('USUARIO_INVALIDO')
              ? 'Usuário inválido. Use letras e números (ex: lucas.souza).'
              : msg.includes('PERFIL_NAO_CARREGOU') || msg.includes('SESSAO_PERDIDA')
                ? 'Conta criada! Houve um erro ao entrar. Atualize a página e faça login.'
                : msg.toLowerCase().includes('password')
                  ? 'Senha muito curta (mínimo 6 caracteres).'
                  : 'Não foi possível criar a conta. Tente de novo.',
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
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <LogoMark size={64} />
          <Txt weight="bold" numberOfLines={1} style={{ fontSize: 22, marginTop: 14 }}>
            Criar conta de auxiliar
          </Txt>
          <Txt weight="semibold" size={13} color={t.inkSoft} style={{ textAlign: 'center', marginTop: 4, maxWidth: 300, lineHeight: 19 }}>
            Use o código que o cooperador te enviou.
          </Txt>
        </View>

        <View style={{ gap: 12 }}>
          <FieldSection>Convite</FieldSection>
          <Field
            label="Código de convite"
            required
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="Ex: 9F3A7C21"
            error={tried && !codeOk ? 'Informe o código' : undefined}
          />
          <FieldSection icon={<IconUser size={16} />}>Seus dados</FieldSection>
          <Field
            label="Nome ou apelido"
            required
            value={name}
            onChangeText={setName}
            placeholder="Ex: Lucas (ou como te chamam)"
            error={tried && !nameOk ? 'Informe seu nome' : undefined}
          />
          <Field
            label="Usuário (para entrar)"
            required
            value={user}
            onChangeText={setUser}
            placeholder="ex: lucas.souza"
            icon={<IconUser size={19} />}
            autoComplete="username"
            error={tried && !userOk ? 'Use 3+ caracteres, comece com letra ou número (pode usar . _ -)' : undefined}
          />
          <Field
            label="Data de nascimento"
            required
            dateMask
            value={birth}
            onChangeText={setBirth}
            placeholder="dd/mm/aaaa"
            icon={<IconCalendar size={19} />}
            error={(tried || birth.length >= 10) && !birthOk ? birthErr : undefined}
          />
          <Field
            label="WhatsApp"
            phoneMask
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-8888"
            icon={<IconWhats size={19} />}
          />
          <FieldSection icon={<IconCalendar size={16} />}>Dados da igreja (opcional)</FieldSection>
          <Field
            label="Data de batismo"
            dateMask
            value={batismo}
            onChangeText={setBatismo}
            placeholder="dd/mm/aaaa (se já batizou)"
            icon={<IconCalendar size={19} />}
            error={(tried || batismo.length >= 10) && batismoErr ? batismoErr : undefined}
          />
          <Segmented
            label="É selado com o Espírito Santo?"
            value={selado ? 'Sim' : 'Não'}
            options={['Sim', 'Não']}
            onChange={(v) => setSelado(v === 'Sim')}
          />
          <Field
            label="Apresentação ao cargo"
            dateMask
            value={presented}
            onChangeText={setPresented}
            placeholder="dd/mm/aaaa (quando foi apresentado)"
            icon={<IconCalendar size={19} />}
            error={(tried || presented.length >= 10) && presentedErr ? presentedErr : undefined}
          />
          <FieldSection icon={<IconLock size={16} />}>Acesso</FieldSection>
          <Field
            label="Senha"
            required
            secureTextEntry
            value={pass}
            onChangeText={setPass}
            placeholder="mínimo 6 caracteres"
            icon={<IconLock size={19} />}
            autoComplete="new-password"
            error={tried && !passOk ? 'Mínimo 6 caracteres' : undefined}
          />
          <Field
            label="Confirmar senha"
            required
            secureTextEntry
            value={pass2}
            onChangeText={setPass2}
            placeholder="repita a senha"
            icon={<IconLock size={19} />}
            autoComplete="new-password"
            error={tried && passOk && !matchOk ? 'As senhas não conferem' : undefined}
          />

          {erro ? (
            <Txt weight="semibold" size={13} color={t.absentDeep}>
              {erro}
            </Txt>
          ) : null}

          <View style={{ height: 4 }} />
          <Button variant="primary" icon={<IconCheck size={19} />} loading={busy} onPress={criar}>
            Criar conta e entrar
          </Button>
          <Button variant="ghost" onPress={() => go('Login')}>
            Já tenho conta
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

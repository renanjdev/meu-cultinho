/** 9. Cadastro de Auxiliar — pessoais, função, acesso ao app. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNav } from '../navigation/useNav';
import { AUX, GROUPS, type Aux } from '../data/seed';
import {
  AppBar,
  Button,
  Field,
  FieldSection,
  Screen,
  ScreenScroll,
  Segmented,
  SelectField,
} from '../components/ui';
import { IconBook, IconCalendar, IconCheck, IconLock, IconUser, IconWhats } from '../components/Icons';

export default function AuxForm() {
  const { go, back } = useNav();
  const [f, setF] = useState<Partial<Aux> & { pass?: string }>({ role: 'Auxiliar', status: 'Ativo' });
  const set = (k: keyof Aux | 'pass') => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const canSave = !!f.name?.trim() && !!f.user?.trim() && !!f.pass?.trim();

  return (
    <Screen>
      <AppBar title="Cadastrar Auxiliar" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <FieldSection icon={<IconUser size={16} />}>Dados pessoais</FieldSection>
        <Field label="Nome completo" placeholder="Ex: Lucas Souza" value={f.name} onChangeText={set('name')} />
        <Field label="WhatsApp" placeholder="(11) 90000-0000" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" icon={<IconWhats size={17} />} />
        <Field label="Data de nascimento" placeholder="dd/mm/aaaa" value={f.birth} onChangeText={set('birth')} icon={<IconCalendar size={17} />} />

        <FieldSection icon={<IconBook size={16} />}>Função na reunião</FieldSection>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Data de batismo" placeholder="dd/mm/aaaa" value={f.baptism} onChangeText={set('baptism')} icon={<IconCalendar size={17} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Apresentação" placeholder="dd/mm/aaaa" value={f.presented} onChangeText={set('presented')} icon={<IconCalendar size={17} />} />
          </View>
        </View>
        <SelectField
          label="Grupos sob responsabilidade"
          value={f.group}
          onChange={set('group')}
          options={[{ value: '', label: 'Selecione...' }, ...GROUPS.map((g) => ({ value: g.id, label: g.name }))]}
        />

        <FieldSection icon={<IconLock size={16} />}>Acesso ao aplicativo</FieldSection>
        <Field label="Usuário de login" placeholder="nome.sobrenome" value={f.user} onChangeText={set('user')} icon={<IconUser size={17} />} />
        <Field label="Senha" secureTextEntry placeholder="••••••••" value={f.pass} onChangeText={set('pass')} icon={<IconLock size={17} />} />
        <Segmented label="Tipo de usuário" value={f.role} options={['Administrador', 'Auxiliar']} onChange={set('role')} />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />

        <View style={{ height: 4 }} />
        <Button variant="primary" icon={<IconCheck size={19} />} disabled={!canSave} onPress={() => go('AuxList')}>
          Salvar auxiliar
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

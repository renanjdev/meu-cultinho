/** 6. Cadastro de Jovem — three sections; Salvar creates a real roster entry. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNav } from '../navigation/useNav';
import { addYouth } from '../state/youthStore';
import { GROUPS, type Youth } from '../data/seed';
import {
  AppBar,
  Button,
  Field,
  FieldSection,
  Screen,
  ScreenScroll,
  Segmented,
  SelectField,
  TextArea,
} from '../components/ui';
import {
  IconCalendar,
  IconCheck,
  IconHeart,
  IconLayers,
  IconMapPin,
  IconUser,
  IconWhats,
} from '../components/Icons';

export default function YouthForm() {
  const { go, back } = useNav();
  const [f, setF] = useState<Partial<Youth>>({ sex: 'Masculino', status: 'Ativo', group: 'g1' });
  const [triedSave, setTriedSave] = useState(false);
  const set = (k: keyof Youth) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const trimmedName = f.name?.trim() ?? '';
  const nameMissing = trimmedName.length === 0;

  return (
    <Screen>
      <AppBar title="Cadastrar Jovem" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <FieldSection icon={<IconUser size={16} />}>Dados pessoais</FieldSection>
        <Field
          label="Nome completo"
          placeholder="Ex: João Miguel Soares"
          value={f.name}
          onChangeText={set('name')}
          error={triedSave && nameMissing ? 'Informe o nome' : undefined}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Data de nascimento" placeholder="dd/mm/aaaa" value={f.birth} onChangeText={set('birth')} keyboardType="number-pad" icon={<IconCalendar size={17} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Segmented label="Sexo" value={f.sex} options={['Masculino', 'Feminino']} onChange={set('sex')} />
          </View>
        </View>

        <FieldSection icon={<IconHeart size={16} />}>Responsáveis</FieldSection>
        <Field label="Nome do pai" placeholder="Nome do pai" value={f.father} onChangeText={set('father')} />
        <Field label="Nome da mãe" placeholder="Nome da mãe" value={f.mother} onChangeText={set('mother')} />
        <Field label="WhatsApp do responsável" placeholder="(11) 90000-0000" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" icon={<IconWhats size={17} />} />
        <Field label="Endereço" placeholder="Rua, número, bairro" value={f.address} onChangeText={set('address')} icon={<IconMapPin size={17} />} />

        <FieldSection icon={<IconLayers size={16} />}>Grupo e observações</FieldSection>
        <SelectField label="Grupo" value={f.group} onChange={set('group')} options={GROUPS.map((g) => ({ value: g.id, label: g.name }))} />
        <TextArea label="Observações" placeholder="Anotações sobre o jovem..." value={f.notes} onChangeText={set('notes')} />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />

        <View style={{ height: 4 }} />
        <Button
          variant="primary"
          icon={<IconCheck size={19} />}
          onPress={() => {
            if (nameMissing) {
              setTriedSave(true);
              return;
            }
            addYouth({ ...f, name: trimmedName });
            go('YouthList');
          }}>
          Salvar jovem
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

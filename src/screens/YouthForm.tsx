/** 6. Cadastro de Jovem — three sections; Salvar creates a real roster entry. */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useNav } from '../navigation/useNav';
import { saveJovem, useGrupoOptions, useJovem } from '../data/repo';
import type { Youth } from '../data/seed';
import type { RootStackParamList } from '../navigation/types';
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
  const route = useRoute<RouteProp<RootStackParamList, 'YouthForm'>>();
  const editId = route.params?.id;
  const { jovem } = useJovem(editId);
  const grupoOptions = useGrupoOptions();
  const [f, setF] = useState<Partial<Youth>>({ sex: 'Masculino', status: 'Ativo', group: '' });
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const set = (k: keyof Youth) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const trimmedName = f.name?.trim() ?? '';
  const nameMissing = trimmedName.length === 0;

  useEffect(() => {
    if (jovem && !prefilled) {
      setF({
        name: jovem.name,
        birth: jovem.birth,
        sex: jovem.sex ?? undefined,
        group: jovem.grupoId ?? '',
        father: jovem.father,
        mother: jovem.mother,
        phone: jovem.phone,
        address: jovem.address,
        notes: jovem.notes,
        status: jovem.status,
      });
      setPrefilled(true);
    }
  }, [jovem, prefilled]);

  const handleSave = async () => {
    if (nameMissing) {
      setTriedSave(true);
      return;
    }
    setSaving(true);
    try {
      await saveJovem({
        id: editId,
        name: trimmedName,
        birth: f.birth,
        sex: f.sex,
        grupo_id: f.group,
        father: f.father,
        mother: f.mother,
        phone: f.phone,
        address: f.address,
        notes: f.notes,
        status: f.status,
      });
      if (back) back();
      else go('YouthList');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AppBar title={editId ? 'Editar Jovem' : 'Cadastrar Jovem'} onBack={back} />
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
        <SelectField label="Grupo" value={f.group} onChange={set('group')} options={grupoOptions} />
        <TextArea label="Observações" placeholder="Anotações sobre o jovem..." value={f.notes} onChangeText={set('notes')} />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />

        <View style={{ height: 4 }} />
        <Button
          variant="primary"
          icon={<IconCheck size={19} />}
          loading={saving}
          onPress={handleSave}>
          Salvar jovem
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

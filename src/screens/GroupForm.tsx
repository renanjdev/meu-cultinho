/** 11. Cadastro de Grupo. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNav } from '../navigation/useNav';
import { AUX } from '../data/seed';
import { AppBar, Button, Field, Screen, ScreenScroll, Segmented, SelectField, TextArea } from '../components/ui';
import { IconCheck } from '../components/Icons';

interface GroupDraft {
  name?: string;
  desc?: string;
  aux?: string;
  status?: string;
}

export default function GroupForm() {
  const { go, back } = useNav();
  const [f, setF] = useState<GroupDraft>({ status: 'Ativo' });
  const set = (k: keyof GroupDraft) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <Screen>
      <AppBar title="Cadastrar Grupo" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Field label="Nome do grupo" placeholder="Ex: Moços" value={f.name} onChangeText={set('name')} />
        <TextArea label="Descrição" placeholder="Para quem é este grupo..." value={f.desc} onChangeText={set('desc')} />
        <SelectField
          label="Auxiliar responsável"
          value={f.aux}
          onChange={set('aux')}
          options={[{ value: '', label: 'Selecione...' }, ...AUX.map((a) => ({ value: a.id, label: a.name }))]}
        />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />
        <View style={{ height: 4 }} />
        <Button variant="primary" icon={<IconCheck size={19} />} onPress={() => go('GroupList')}>
          Salvar grupo
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

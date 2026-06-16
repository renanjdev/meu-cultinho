/** 11. Cadastro/edição de Grupo (persiste no Supabase). */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import {
  useGrupo,
  useAuxiliares,
  saveGrupo,
  useGrupoAuxiliares,
  setGrupoAuxiliares,
  type GroupIcon,
} from '../data/repo';
import type { RootStackParamList } from '../navigation/types';
import {
  AppBar,
  Button,
  CheckChips,
  Field,
  Screen,
  ScreenScroll,
  Segmented,
  SelectField,
  TextArea,
} from '../components/ui';
import { IconCheck } from '../components/Icons';

interface GroupDraft {
  name: string;
  desc: string;
  auxId: string;
  status: string;
}

export default function GroupForm() {
  const { go, back } = useNav();
  const { show } = useToast();
  const route = useRoute<RouteProp<RootStackParamList, 'GroupForm'>>();
  const id = route.params?.id;
  const { grupo } = useGrupo(id);
  const { auxiliares } = useAuxiliares();
  const { ids: membroIds, loading: membroLoading } = useGrupoAuxiliares(id);
  const [f, setF] = useState<GroupDraft>({ name: '', desc: '', auxId: '', status: 'Ativo' });
  const [membros, setMembros] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [membrosSeeded, setMembrosSeeded] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [busy, setBusy] = useState(false);

  // opções de membros = só auxiliares (o responsável pode ser definido à parte)
  const auxOptions = auxiliares
    .filter((a) => a.role === 'auxiliar')
    .map((a) => ({ value: a.id, label: a.name }));

  // semeia o form quando a ficha do grupo carrega (modo edição) — uma vez só
  useEffect(() => {
    if (grupo && !seeded) {
      setF({ name: grupo.name, desc: grupo.description, auxId: grupo.auxId ?? '', status: grupo.status });
      setSeeded(true);
    }
  }, [grupo, seeded]);

  // semeia os membros quando o vínculo carrega (após o fetch, não no [] inicial)
  useEffect(() => {
    if (!membroLoading && !membrosSeeded) {
      setMembros(membroIds);
      setMembrosSeeded(true);
    }
  }, [membroLoading, membroIds, membrosSeeded]);

  const set = (k: keyof GroupDraft) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const nameEmpty = !f.name.trim();

  const onSave = async () => {
    if (nameEmpty) {
      setTriedSave(true);
      return;
    }
    setBusy(true);
    try {
      const gid = await saveGrupo({
        id,
        name: f.name,
        description: f.desc,
        auxId: f.auxId || null,
        status: f.status,
        icon: (grupo?.icon as GroupIcon) || undefined,
      });
      await setGrupoAuxiliares(gid, membros);
      go('GroupList');
    } catch {
      show('Não foi possível salvar o grupo.', 'error');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppBar title={id ? 'Editar grupo' : 'Cadastrar grupo'} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Field
          label="Nome do grupo"
          required
          placeholder="Ex: Moços"
          value={f.name}
          onChangeText={set('name')}
          error={triedSave && nameEmpty ? 'Informe o nome do grupo' : undefined}
        />
        <TextArea label="Descrição" placeholder="Para quem é este grupo..." value={f.desc} onChangeText={set('desc')} />
        <SelectField
          label="Auxiliar responsável"
          value={f.auxId}
          onChange={set('auxId')}
          options={[{ value: '', label: 'Sem responsável' }, ...auxiliares.map((a) => ({ value: a.id, label: a.name }))]}
        />
        <CheckChips
          label="Auxiliares deste grupo"
          options={auxOptions}
          value={membros}
          onChange={setMembros}
          empty="Nenhum auxiliar cadastrado ainda."
        />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />
        <View style={{ height: 8 }} />
        <Button variant="primary" icon={<IconCheck size={19} />} loading={busy} onPress={onSave}>
          Salvar grupo
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

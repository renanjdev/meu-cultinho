/**
 * 9. Editar auxiliar — no modelo auxiliar=jovem: os dados da PESSOA (nome,
 * nascimento, batismo, selado, foto) gravam na ficha de jovem vinculada (o
 * trigger espelha nome/nascimento de volta pro login); a função (apresentação,
 * status) grava na conta. O cooperador (sem jovem) é editado direto na conta.
 * A CRIAÇÃO de auxiliar é por link de convite (ver InviteAux), não aqui.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useSession } from '../state/session';
import { useToast } from '../components/Toast';
import { pickImage, uploadPhoto } from '../data/photos';
import { useAuxiliar, useJovem, saveJovem, updateAuxiliar, updatePhotoUrl } from '../data/repo';
import { validateDateBR } from '../data/date';
import type { RootStackParamList } from '../navigation/types';
import {
  AppBar,
  Avatar,
  Button,
  Field,
  FieldSection,
  Screen,
  ScreenScroll,
  Segmented,
  Txt,
} from '../components/ui';
import { IconBook, IconCalendar, IconCheck, IconPlus, IconUser, IconWhats } from '../components/Icons';

interface AuxDraft {
  name: string;
  phone: string;
  birth: string;
  batizado: string;
  batismo: string;
  selado: boolean;
  presented: string;
  status: string;
}

export default function AuxForm() {
  const t = useTheme();
  const { back } = useNav();
  const { show } = useToast();
  const { session, refresh } = useSession();
  const route = useRoute<RouteProp<RootStackParamList, 'AuxForm'>>();
  const id = route.params?.id;

  const { aux } = useAuxiliar(id);
  const { jovem } = useJovem(aux?.jovemId ?? undefined);
  const linked = !!aux?.jovemId;
  const isAdmin = session?.role === 'cooperador';
  const isSelf = id === session?.userId;
  const canEditStatus = isAdmin && !isSelf;

  const [f, setF] = useState<AuxDraft>({
    name: '', phone: '', birth: '', batizado: 'Não', batismo: '', selado: false, presented: '', status: 'Ativo',
  });
  const [seeded, setSeeded] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; isNew: boolean } | null>(null);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);

  // semeia quando a conta (e a ficha de jovem vinculada) carregam — uma vez só
  useEffect(() => {
    if (!aux || seeded) return;
    if (aux.jovemId && !jovem) return;
    setF({
      name: jovem?.name ?? aux.name,
      phone: aux.phone,
      birth: jovem?.birth ?? aux.birth,
      batizado: (jovem?.batizado ?? false) ? 'Sim' : 'Não',
      batismo: jovem?.batismo ?? aux.baptism ?? '',
      selado: jovem?.selado ?? false,
      presented: aux.presented,
      status: aux.status,
    });
    const url = jovem?.photoUrl || aux.photoUrl;
    if (url) setPhoto({ uri: url, isNew: false });
    setSeeded(true);
  }, [aux, jovem, seeded]);

  const set = (k: keyof AuxDraft) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const nameMissing = !f.name.trim();
  const birthErr = f.birth.trim() ? validateDateBR(f.birth) : '';
  const batismoErr = f.batizado === 'Sim' && f.batismo.trim() ? validateDateBR(f.batismo) : '';
  const presentedErr = f.presented.trim() ? validateDateBR(f.presented) : '';

  const pickPhoto = async () => {
    try {
      const uri = await pickImage();
      if (uri) setPhoto({ uri, isNew: true });
    } catch {
      show('Erro ao selecionar a foto', 'error');
    }
  };

  const onSave = async () => {
    if (!id || !aux) return;
    if (nameMissing || birthErr || batismoErr || presentedErr) {
      setTried(true);
      return;
    }
    setSaving(true);
    try {
      const name = f.name.trim();
      // 1) PESSOA: na ficha de jovem (vinculado), preservando os demais campos
      if (linked && jovem) {
        await saveJovem({
          id: jovem.id,
          name,
          birth: f.birth,
          sex: jovem.sex ?? undefined,
          batizado: f.batizado === 'Sim',
          batismo: f.batizado === 'Sim' ? f.batismo : undefined,
          selado: f.selado,
          grupo_id: jovem.grupoId,
          father: jovem.father,
          mother: jovem.mother,
          phone: f.phone,
          address: jovem.address,
          notes: jovem.notes,
          status: jovem.status,
        });
      }
      // 2) CONTA: nome/nascimento já sincronizam p/ vinculados via espelho, mas
      //    p/ o cooperador (sem jovem) é aqui que grava. status só quando admin.
      await updateAuxiliar(id, {
        name,
        birth: f.birth,
        phone: f.phone,
        baptism: f.batizado === 'Sim' ? f.batismo : '',
        presented: f.presented,
        status: canEditStatus ? f.status : undefined,
      });
      // 3) FOTO: uma URL, aplicada na conta e (se vinculado) na ficha de jovem
      if (photo?.isNew) {
        const url = await uploadPhoto('auxiliares', id, photo.uri);
        await updatePhotoUrl('auxiliares', id, url);
        if (linked && aux.jovemId) await updatePhotoUrl('jovens', aux.jovemId, url);
      }
      if (isSelf) await refresh();
      if (back) back();
    } catch (e) {
      console.error('[salvar auxiliar]', e);
      show('Não foi possível salvar. Tente de novo.', 'error');
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <Screen>
        <AppBar title="Auxiliar" onBack={back} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Txt color={t.inkSoft}>Auxiliar não informado.</Txt>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar title={isSelf ? 'Editar meu perfil' : 'Editar auxiliar'} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Trocar foto">
            <Avatar name={f.name || aux?.name || ''} size={88} photoUrl={photo?.uri} />
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: t.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: t.surface,
              }}>
              <IconPlus size={15} color={t.onPrimary} />
            </View>
          </Pressable>
          <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ marginTop: 8 }}>
            {photo ? 'Trocar foto' : 'Adicionar foto'}
          </Txt>
          {aux?.username ? (
            <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ marginTop: 2 }}>
              usuário: {aux.username}
            </Txt>
          ) : null}
        </View>

        <FieldSection icon={<IconUser size={16} />}>Dados pessoais</FieldSection>
        <Field
          label="Nome completo"
          required
          value={f.name}
          onChangeText={set('name')}
          placeholder="Ex: Lucas Souza"
          error={tried && nameMissing ? 'Informe o nome' : undefined}
        />
        <Field
          label="WhatsApp"
          phoneMask
          value={f.phone}
          onChangeText={set('phone')}
          placeholder="(11) 99999-8888"
          icon={<IconWhats size={17} />}
        />
        <Field
          label="Nascimento"
          dateMask
          value={f.birth}
          onChangeText={set('birth')}
          placeholder="dd/mm/aaaa"
          icon={<IconCalendar size={17} />}
          error={(tried || f.birth.length >= 10) && birthErr ? birthErr : undefined}
        />

        {linked ? (
          <>
            <FieldSection icon={<IconBook size={16} />}>Igreja</FieldSection>
            <Segmented
              label="É batizado?"
              value={f.batizado}
              options={['Sim', 'Não']}
              onChange={(v) => setF((s) => ({ ...s, batizado: v, batismo: v === 'Sim' ? s.batismo : '' }))}
            />
            {f.batizado === 'Sim' ? (
              <Field
                label="Data do batismo"
                dateMask
                value={f.batismo}
                onChangeText={set('batismo')}
                placeholder="dd/mm/aaaa"
                icon={<IconCalendar size={17} />}
                error={(tried || f.batismo.length >= 10) && batismoErr ? batismoErr : undefined}
              />
            ) : null}
            <Segmented
              label="É selado com o Espírito Santo?"
              value={f.selado ? 'Sim' : 'Não'}
              options={['Sim', 'Não']}
              onChange={(v) => setF((s) => ({ ...s, selado: v === 'Sim' }))}
            />
          </>
        ) : null}

        <FieldSection icon={<IconCalendar size={16} />}>Função</FieldSection>
        <Field
          label="Apresentação ao cargo"
          dateMask
          value={f.presented}
          onChangeText={set('presented')}
          placeholder="dd/mm/aaaa"
          icon={<IconCalendar size={17} />}
          error={(tried || f.presented.length >= 10) && presentedErr ? presentedErr : undefined}
        />
        {canEditStatus ? (
          <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />
        ) : null}

        <View style={{ height: 8 }} />
        <Button variant="primary" icon={<IconCheck size={19} />} loading={saving} onPress={onSave}>
          Salvar
        </Button>
        <Button variant="ghost" onPress={back}>
          Cancelar
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

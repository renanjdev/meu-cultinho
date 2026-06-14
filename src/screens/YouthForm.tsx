/** 6. Cadastro de Jovem — three sections; Salvar creates a real roster entry. */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { saveJovem, updatePhotoUrl, useGrupoOptions, useJovem } from '../data/repo';
import { pickImage, uploadPhoto } from '../data/photos';
import { validateDateBR } from '../data/date';
import type { Youth } from '../data/seed';
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
  SelectField,
  TextArea,
  Txt,
} from '../components/ui';
import {
  IconBook,
  IconCalendar,
  IconCheck,
  IconHeart,
  IconLayers,
  IconMapPin,
  IconPlus,
  IconUser,
  IconWhats,
} from '../components/Icons';

// Campos de batismo vivem só no formulário (Sim/Não vira boolean no save).
type FormState = Partial<Youth> & { batizado?: string; batismo?: string };

export default function YouthForm() {
  const t = useTheme();
  const { go, back } = useNav();
  const { show } = useToast();
  const route = useRoute<RouteProp<RootStackParamList, 'YouthForm'>>();
  const editId = route.params?.id;
  const { jovem } = useJovem(editId);
  const grupoOptions = useGrupoOptions();
  const [f, setF] = useState<FormState>({ sex: 'Masculino', status: 'Ativo', group: '', batizado: 'Não' });
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; isNew: boolean } | null>(null);
  const set = (k: keyof FormState) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const pickPhoto = async () => {
    try {
      const uri = await pickImage();
      if (uri) setPhoto({ uri, isNew: true });
    } catch {
      show('Erro ao selecionar a foto');
    }
  };
  const trimmedName = f.name?.trim() ?? '';
  const nameMissing = trimmedName.length === 0;

  // Datas opcionais, mas se preenchidas precisam ser válidas e não-futuras.
  const birthRaw = f.birth ?? '';
  const birthErr = birthRaw.trim() ? validateDateBR(birthRaw) : '';
  const showBirthErr = !!birthErr && (triedSave || birthRaw.length >= 10);

  const batismoRaw = f.batismo ?? '';
  const batismoErr =
    f.batizado === 'Sim' && batismoRaw.trim() ? validateDateBR(batismoRaw) : '';
  // mostra o erro só quando a data parece completa ou após tentar salvar
  const showBatismoErr = !!batismoErr && (triedSave || batismoRaw.length >= 10);

  useEffect(() => {
    if (jovem && !prefilled) {
      setF({
        name: jovem.name,
        birth: jovem.birth,
        sex: jovem.sex ?? undefined,
        batizado: jovem.batizado ? 'Sim' : 'Não',
        batismo: jovem.batismo,
        group: jovem.grupoId ?? '',
        father: jovem.father,
        mother: jovem.mother,
        phone: jovem.phone,
        address: jovem.address,
        notes: jovem.notes,
        status: jovem.status,
      });
      if (jovem.photoUrl) setPhoto({ uri: jovem.photoUrl, isNew: false });
      setPrefilled(true);
    }
  }, [jovem, prefilled]);

  const handleSave = async () => {
    if (nameMissing || batismoErr || birthErr) {
      setTriedSave(true);
      return;
    }
    setSaving(true);
    try {
      const id = await saveJovem({
        id: editId,
        name: trimmedName,
        birth: f.birth,
        sex: f.sex,
        batizado: f.batizado === 'Sim',
        batismo: f.batizado === 'Sim' ? f.batismo : undefined,
        grupo_id: f.group,
        father: f.father,
        mother: f.mother,
        phone: f.phone,
        address: f.address,
        notes: f.notes,
        status: f.status,
      });
      if (photo?.isNew) {
        const url = await uploadPhoto('jovens', id, photo.uri);
        await updatePhotoUrl('jovens', id, url);
      }
      if (back) back();
      else go('YouthList');
    } catch (e) {
      console.error('[salvar jovem]', e);
      show('Não foi possível salvar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AppBar title={editId ? 'Editar Jovem' : 'Cadastrar Jovem'} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Pressable
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={photo ? 'Trocar foto do jovem' : 'Adicionar foto do jovem'}>
            <Avatar name={trimmedName || 'Jovem'} size={88} photoUrl={photo?.uri} />
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
        </View>
        <FieldSection icon={<IconUser size={16} />}>Dados pessoais</FieldSection>
        <Field
          label="Nome completo"
          required
          placeholder="Ex: João Miguel Soares"
          value={f.name}
          onChangeText={set('name')}
          error={triedSave && nameMissing ? 'Informe o nome' : undefined}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Nascimento" dateMask placeholder="dd/mm/aaaa" value={f.birth} onChangeText={set('birth')} icon={<IconCalendar size={17} />} error={showBirthErr ? birthErr : undefined} />
          </View>
          <View style={{ flex: 1 }}>
            <Segmented label="Sexo" value={f.sex} options={['Masculino', 'Feminino']} onChange={set('sex')} />
          </View>
        </View>

        <FieldSection icon={<IconBook size={16} />}>Batismo</FieldSection>
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
            placeholder="dd/mm/aaaa"
            value={f.batismo}
            onChangeText={set('batismo')}
            icon={<IconCalendar size={17} />}
            error={showBatismoErr ? batismoErr : undefined}
          />
        ) : null}

        <FieldSection icon={<IconHeart size={16} />}>Responsáveis</FieldSection>
        <Field label="Nome do pai" placeholder="Ex: Carlos Souza" value={f.father} onChangeText={set('father')} />
        <Field label="Nome da mãe" placeholder="Ex: Maria Souza" value={f.mother} onChangeText={set('mother')} />
        <Field label="WhatsApp do responsável" placeholder="(11) 90000-0000" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" icon={<IconWhats size={17} />} />
        <Field label="Endereço" placeholder="Rua, número, bairro" value={f.address} onChangeText={set('address')} icon={<IconMapPin size={17} />} />

        <FieldSection icon={<IconLayers size={16} />}>Grupo e observações</FieldSection>
        <SelectField label="Grupo" value={f.group} onChange={set('group')} options={grupoOptions} />
        <TextArea label="Observações" placeholder="Anotações sobre o jovem..." value={f.notes} onChangeText={set('notes')} />
        <Segmented label="Status" value={f.status} options={['Ativo', 'Inativo']} onChange={set('status')} />

        <View style={{ height: 8 }} />
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

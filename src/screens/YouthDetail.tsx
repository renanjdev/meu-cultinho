/** 7. Detalhes do Jovem — hero, stats, guardian info, recent history, delete. */
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useJovem, deleteJovem } from '../data/repo';
import { ageFrom } from '../data/age';
import type { RootStackParamList } from '../navigation/types';
import {
  AppBar,
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  InfoRow,
  Screen,
  ScreenScroll,
  SectionLabel,
  StatTile,
  StatusChip,
  Txt,
} from '../components/ui';
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconEdit,
  IconMapPin,
  IconUser,
  IconWhats,
  IconX,
  IconXCircle,
} from '../components/Icons';

export default function YouthDetail() {
  const t = useTheme();
  const { go, back } = useNav();
  const route = useRoute<RouteProp<RootStackParamList, 'YouthDetail'>>();
  const { jovem: j } = useJovem(route.params?.id);
  const [confirm, setConfirm] = useState(false);

  const divider = <View style={{ height: 1, backgroundColor: t.line, marginVertical: 12 }} />;

  if (!j) {
    return (
      <Screen>
        <AppBar title="Detalhes do Jovem" onBack={back} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Txt color={t.inkSoft}>Jovem não encontrado.</Txt>
        </View>
      </Screen>
    );
  }

  // "há X anos" desde o batismo (só quando batizado e com data válida).
  const tempoBatismo = (() => {
    if (!j.batizado || !j.batismo) return '';
    const anos = ageFrom(j.batismo);
    if (anos < 0) return ''; // data futura/erro de digitação: mostra só a data
    if (anos === 0) return 'há menos de 1 ano';
    return `há ${anos} ano${anos > 1 ? 's' : ''}`;
  })();

  return (
    <Screen>
      <AppBar
        title="Detalhes do Jovem"
        onBack={back}
        right={
          <IconButton soft accessibilityLabel="Editar" onPress={() => go('YouthForm', { id: j.id })}>
            <IconEdit size={19} color={t.primary} />
          </IconButton>
        }
      />
      <ScreenScroll contentStyle={{ padding: 0, gap: 0, paddingBottom: 24 }}>
        {/* hero */}
        <LinearGradient
          colors={t.gradientHero}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={{ alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 18 }}>
          <Avatar name={j.name} size={86} photoUrl={j.photoUrl} />
          <Txt weight="bold" size={21} style={{ marginTop: 14, marginBottom: 4, textAlign: 'center' }}>
            {j.name}
          </Txt>
          <Txt weight="semibold" size={13.5} color={t.inkSoft} numberOfLines={1}>
            {j.age} anos · {j.grupoName}
          </Txt>
          <View style={{ marginTop: 10 }}>
            <StatusChip kind={j.status} />
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 12 }}>
          {/* stats */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatTile num={0} label="Presenças" tone="present" style={{ flex: 1 }} />
            <StatTile num={0} label="Faltas" tone="absent" style={{ flex: 1 }} />
            <StatTile num="—" label="Frequência" tone="primary" style={{ flex: 1 }} />
          </View>

          <SectionLabel>Batismo</SectionLabel>
          <Card pad>
            <InfoRow
              icon={j.batizado ? <IconCheckCircle size={18} /> : <IconXCircle size={18} />}
              label="Situação"
              value={j.batizado ? 'Batizado' : 'Não batizado'}
            />
            {j.batizado ? (
              <>
                {divider}
                <InfoRow
                  icon={<IconCalendar size={18} />}
                  label="Data do batismo"
                  value={j.batismo ? `${j.batismo}${tempoBatismo ? ` · ${tempoBatismo}` : ''}` : 'Não informada'}
                />
              </>
            ) : null}
          </Card>

          <SectionLabel>Dados do responsável</SectionLabel>
          <Card pad>
            <InfoRow icon={<IconUser size={18} />} label="Pai" value={j.father} />
            {divider}
            <InfoRow icon={<IconUser size={18} />} label="Mãe" value={j.mother} />
            {divider}
            <InfoRow
              icon={<IconWhats size={18} />}
              label="WhatsApp"
              value={j.phone}
              action={
                <Button
                  sm
                  variant="secondary"
                  onPress={() => Linking.openURL('https://wa.me/55' + j.phone.replace(/\D/g, ''))}>
                  Chamar
                </Button>
              }
            />
            {divider}
            <InfoRow icon={<IconMapPin size={18} />} label="Endereço" value={j.address} />
          </Card>

          <SectionLabel>Histórico recente</SectionLabel>
          <Card pad>
            <Txt color={t.inkSoft}>Sem registros ainda.</Txt>
          </Card>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <Button variant="secondary" icon={<IconEdit size={18} />} style={{ flex: 1 }} onPress={() => go('YouthForm', { id: j.id })}>
              Editar
            </Button>
            <Button variant="primary" icon={<IconClock size={18} />} style={{ flex: 1 }} onPress={() => go('History')}>
              Histórico
            </Button>
          </View>
          <Button variant="danger-soft" icon={<IconX size={18} />} onPress={() => setConfirm(true)}>
            Excluir jovem
          </Button>
        </View>
      </ScreenScroll>

      <ConfirmDialog
        open={confirm}
        danger
        title="Excluir jovem?"
        message={`${j.name} será removido(a) da lista. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setConfirm(false);
          await deleteJovem(j.id);
          go('YouthList');
        }}
      />
    </Screen>
  );
}

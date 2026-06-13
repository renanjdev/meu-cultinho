/** 7. Detalhes do Jovem — hero, stats, guardian info, recent history, delete. */
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { deleteYouth, getYouth } from '../state/youthStore';
import { YOUTH, groupName, type AttendanceMark } from '../data/seed';
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
  IconClock,
  IconEdit,
  IconMapPin,
  IconUser,
  IconWhats,
  IconX,
} from '../components/Icons';

const RECENT: [string, AttendanceMark][] = [
  ['02 jun', 'Presente'],
  ['26 mai', 'Falta'],
  ['19 mai', 'Presente'],
  ['12 mai', 'Presente'],
];

export default function YouthDetail() {
  const t = useTheme();
  const { go, back } = useNav();
  const route = useRoute<RouteProp<RootStackParamList, 'YouthDetail'>>();
  const j = getYouth(route.params?.id) ?? YOUTH[2];
  const [confirm, setConfirm] = useState(false);

  const divider = <View style={{ height: 1, backgroundColor: t.line, marginVertical: 11 }} />;

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
          <Avatar name={j.name} size={86} />
          <Txt weight="bold" size={21} style={{ marginTop: 14, marginBottom: 3, textAlign: 'center' }}>
            {j.name}
          </Txt>
          <Txt weight="semibold" size={13.5} color={t.inkSoft} numberOfLines={1}>
            {j.age} anos · {groupName(j.group)}
          </Txt>
          <View style={{ marginTop: 10 }}>
            <StatusChip kind={j.status} />
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 14 }}>
          {/* stats */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatTile num={j.present} label="Presenças" tone="present" style={{ flex: 1 }} />
            <StatTile num={j.absent} label="Faltas" tone="absent" style={{ flex: 1 }} />
            <StatTile num={`${j.freq}%`} label="Frequência" tone="primary" style={{ flex: 1 }} />
          </View>

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
            {RECENT.map(([date, mark], i) => (
              <View key={date}>
                {i > 0 ? divider : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Txt weight="bold" size={14}>
                    {date}
                  </Txt>
                  <StatusChip kind={mark} />
                </View>
              </View>
            ))}
          </Card>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
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
        onConfirm={() => {
          setConfirm(false);
          deleteYouth(j.id);
          go('YouthList');
        }}
      />
    </Screen>
  );
}

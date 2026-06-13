/** 10. Grupos — manage groups; each card has Editar / Jovens / Frequência. */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { GROUPS } from '../data/seed';
import {
  AppBar,
  Button,
  Card,
  Fab,
  GroupIcon,
  MiniStat,
  Screen,
  ScreenScroll,
  StatusChip,
  Txt,
} from '../components/ui';
import { IconCheckCircle, IconClock, IconUsers } from '../components/Icons';

export default function GroupList() {
  const t = useTheme();
  const { go, back } = useNav();

  return (
    <Screen>
      <AppBar title="Grupos" sub={`${GROUPS.length} grupos`} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 96 }}>
        {GROUPS.map((g) => (
          <Card key={g.id} pad>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}>
              <GroupIcon icon={g.icon} size={48} />
              <View style={{ flex: 1 }}>
                <Txt weight="bold" size={15.5} numberOfLines={2}>
                  {g.name}
                </Txt>
                <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ marginTop: 2 }} numberOfLines={1}>
                  Resp.: {g.aux}
                </Txt>
              </View>
              <StatusChip kind={g.status} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <MiniStat icon={<IconUsers size={15} />} label={`${g.count} jovens`} />
              <MiniStat icon={<IconCheckCircle size={15} />} label={`${g.freq}%`} tone="present" />
              <MiniStat icon={<IconClock size={15} />} label={g.last} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button sm variant="secondary" style={{ flex: 1 }} onPress={() => go('GroupForm')}>
                Editar
              </Button>
              <Button sm variant="secondary" style={{ flex: 1 }} onPress={() => go('YouthList')}>
                Jovens
              </Button>
              <Button sm bg={t.primary} fg={t.onPrimary} style={{ flex: 1 }} onPress={() => go('Attendance', { group: g.id })}>
                Frequência
              </Button>
            </View>
          </Card>
        ))}
      </ScreenScroll>
      <Fab label="Novo Grupo" onPress={() => go('GroupForm')} />
    </Screen>
  );
}

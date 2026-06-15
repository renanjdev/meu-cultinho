/** 10. Grupos — manage groups; each card has Editar / Jovens / Frequência. */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useGrupos } from '../data/repo';
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
import { IconUsers } from '../components/Icons';

export default function GroupList() {
  const t = useTheme();
  const { go, back } = useNav();
  const { grupos } = useGrupos();

  return (
    <Screen>
      <AppBar title="Grupos" sub={`${grupos.length} grupos`} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 96 }}>
        {grupos.length === 0 && (
          <Card pad>
            <Txt color={t.inkSoft}>Nenhum grupo cadastrado ainda.</Txt>
          </Card>
        )}
        {grupos.map((g) => (
          <Card key={g.id} pad>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <GroupIcon icon={g.icon} size={48} />
              <View style={{ flex: 1 }}>
                <Txt weight="bold" size={16} numberOfLines={2}>
                  {g.name}
                </Txt>
                <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ marginTop: 2 }} numberOfLines={1}>
                  Resp.: {g.auxName}
                </Txt>
              </View>
              <StatusChip kind={g.status} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <MiniStat icon={<IconUsers size={15} />} label={`${g.count} jovens`} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Button sm variant="secondary" style={{ flex: 1 }} onPress={() => go('GroupForm', { id: g.id })}>
                Editar
              </Button>
              <Button sm variant="secondary" style={{ flex: 1 }} onPress={() => go('YouthList', { group: g.id })}>
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

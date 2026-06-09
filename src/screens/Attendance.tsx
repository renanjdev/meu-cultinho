/**
 * 12. Registrar Frequência — the centerpiece.
 * Big Presente/Falta buttons; the card turns soft-green or soft-red on mark.
 * Designed so a helper can record presence fast, without thinking.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { GROUPS, YOUTH } from '../data/seed';
import type { RootStackParamList } from '../navigation/types';
import {
  AppBar,
  Avatar,
  Button,
  Card,
  Field,
  IconButton,
  MarkBtn,
  Screen,
  SelectField,
  SumPill,
  Txt,
} from '../components/ui';
import { IconCalendar, IconCheck, IconNote } from '../components/Icons';

type Mark = 'present' | 'absent';

export default function Attendance() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { go, back } = useNav();
  const route = useRoute<RouteProp<RootStackParamList, 'Attendance'>>();
  const [grp, setGrp] = useState(route.params?.group ?? 'g5');
  const roster = useMemo(() => YOUTH.filter((j) => j.group === grp && j.status === 'Ativo'), [grp]);
  const [marks, setMarks] = useState<Record<string, Mark | undefined>>({});

  useEffect(() => setMarks({}), [grp]);

  const present = Object.values(marks).filter((v) => v === 'present').length;
  const absent = Object.values(marks).filter((v) => v === 'absent').length;
  const pending = roster.length - present - absent;
  const mark = (id: string, v: Mark) => setMarks((m) => ({ ...m, [id]: m[id] === v ? undefined : v }));

  return (
    <Screen>
      <AppBar title="Registrar Frequência" onBack={back} />

      {/* controls */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, gap: 10 }}>
        <Field label="Data da reunião" value="08/06/2025" editable={false} icon={<IconCalendar size={17} />} />
        <SelectField label="Grupo" value={grp} onChange={setGrp} options={GROUPS.map((g) => ({ value: g.id, label: g.name }))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SumPill num={roster.length} label="Total" tone="ink" />
          <SumPill num={present} label="Presentes" tone="present" />
          <SumPill num={absent} label="Faltas" tone="absent" />
          <SumPill num={pending} label="Pendentes" tone="gold" />
        </View>
      </View>

      {/* roster */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 96 }}>
        {roster.map((j) => {
          const st = marks[j.id];
          const cardStyle =
            st === 'present'
              ? { backgroundColor: t.presentSoft, borderColor: t.presentLine }
              : st === 'absent'
                ? { backgroundColor: t.absentSoft, borderColor: t.absentLine }
                : undefined;
          return (
            <Card key={j.id} pad style={cardStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={j.name} size={46} />
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" size={15} numberOfLines={1}>
                    {j.name}
                  </Txt>
                  <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                    {j.age} anos
                  </Txt>
                </View>
                <IconButton style={{ width: 38, height: 38, backgroundColor: t.surface2 }}>
                  <IconNote size={18} color={t.inkSoft} />
                </IconButton>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <MarkBtn active={st === 'present'} kind="present" onPress={() => mark(j.id, 'present')} />
                <MarkBtn active={st === 'absent'} kind="absent" onPress={() => mark(j.id, 'absent')} />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* sticky save */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
          backgroundColor: t.surface,
          borderTopWidth: 1,
          borderTopColor: t.line,
        }}>
        <Button variant="primary" icon={<IconCheck size={19} />} onPress={() => go('History')}>
          {pending > 0 ? `Salvar frequência · ${pending} pendente${pending > 1 ? 's' : ''}` : 'Salvar frequência'}
        </Button>
      </View>
    </Screen>
  );
}

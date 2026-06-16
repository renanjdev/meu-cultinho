/**
 * 12. Registrar Frequência — the centerpiece (real, persisted).
 * Big Presente/Falta buttons; the card turns soft-green or soft-red on mark.
 * Each tap writes to the `presencas` table immediately (optimistic UI).
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useSession } from '../state/session';
import {
  useGrupos,
  useJovens,
  useMarks,
  setMark,
  todayISO,
  isoToBR,
  brToISO,
  type Mark,
} from '../data/repo';
import { validateDateBR } from '../data/date';
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
import { useToast } from '../components/Toast';

export default function Attendance() {
  const t = useTheme();
  const { show } = useToast();
  const insets = useSafeAreaInsets();
  const { go, back } = useNav();
  const { session } = useSession();
  const route = useRoute<RouteProp<RootStackParamList, 'Attendance'>>();

  // Data EDITÁVEL (default hoje) para permitir lançamento retroativo. dateISO só
  // é válido quando a data é uma dd/mm/aaaa real e não-futura.
  const [dateBR, setDateBR] = useState(isoToBR(todayISO()));
  const dateErr = dateBR.trim() ? validateDateBR(dateBR) : 'Informe a data';
  const dateOk = !dateErr;
  const dateISO = dateOk ? brToISO(dateBR) : '';
  const { grupos } = useGrupos();
  const { jovens } = useJovens();
  const [grp, setGrp] = useState(route.params?.group ?? '');

  // Default to the first group once groups load (or if the param isn't valid).
  useEffect(() => {
    if (grupos.length && !grupos.some((g) => g.id === grp)) {
      setGrp(grupos[0].id);
    }
  }, [grupos, grp]);

  const roster = jovens.filter((j) => j.grupoId === grp && j.status === 'Ativo');
  const { marks, setMarks, reload } = useMarks(dateISO, grp || undefined);

  // contar só sobre o roster atual: evita "pendentes" negativo quando uma marca
  // antiga é de alguém que saiu do grupo/foi inativado, e mantém os pills
  // coerentes com a lista exibida.
  const present = roster.filter((j) => marks[j.id] === 'present').length;
  const absent = roster.filter((j) => marks[j.id] === 'absent').length;
  const pending = roster.length - present - absent;

  // Toggle + persist. Tapping the active mark again clears it (deletes the row).
  const mark = async (id: string, v: Mark) => {
    if (!dateOk) {
      show('Informe uma data válida para registrar.', 'info');
      return;
    }
    const next: Mark | null = marks[id] === v ? null : v;
    setMarks((m) => {
      const c = { ...m };
      if (next === null) delete c[id];
      else c[id] = next;
      return c;
    });
    try {
      await setMark(dateISO, grp, id, next, session?.userId);
    } catch {
      show('Erro ao salvar a presença', 'error');
      void reload();
    }
  };

  return (
    <Screen>
      <AppBar title="Registrar Frequência" onBack={back} />

      {/* controls */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, gap: 12 }}>
        <Field
          label="Data da reunião"
          dateMask
          value={dateBR}
          onChangeText={setDateBR}
          placeholder="dd/mm/aaaa"
          icon={<IconCalendar size={17} />}
          error={dateBR.length >= 10 && dateErr ? dateErr : undefined}
        />
        <SelectField label="Grupo" value={grp} onChange={setGrp} options={grupos.map((g) => ({ value: g.id, label: g.name }))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SumPill num={roster.length} label="Total" tone="ink" />
          <SumPill num={present} label="Presentes" tone="present" />
          <SumPill num={absent} label="Faltas" tone="absent" />
          <SumPill num={pending} label="Pendentes" tone="gold" />
        </View>
        <Txt weight="semibold" size={12} color={t.inkSoft} style={{ textAlign: 'center' }}>
          Salvo automaticamente. Mude a data para lançar retroativo.
        </Txt>
      </View>

      {/* roster */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}>
        {roster.length === 0 ? (
          <Txt weight="semibold" color={t.inkSoft} style={{ textAlign: 'center', paddingVertical: 30 }}>
            Nenhum jovem ativo neste grupo.
          </Txt>
        ) : null}
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
                <Avatar name={j.name} size={46} photoUrl={j.photoUrl} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt weight="bold" size={16} numberOfLines={1}>
                    {j.name}
                  </Txt>
                  <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                    {j.hasAge ? `${j.age} anos` : 'Idade não informada'}
                  </Txt>
                </View>
                <IconButton
                  accessibilityLabel="Observação"
                  onPress={() => show('Em breve', 'info')}
                  style={{ width: 44, height: 44, backgroundColor: t.surface2 }}>
                  <IconNote size={18} color={t.inkSoft} />
                </IconButton>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <MarkBtn active={st === 'present'} kind="present" onPress={() => mark(j.id, 'present')} />
                <MarkBtn active={st === 'absent'} kind="absent" onPress={() => mark(j.id, 'absent')} />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* sticky finish */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
          backgroundColor: t.surface,
          borderTopWidth: 1,
          borderTopColor: t.line,
        }}>
        <Button
          variant="primary"
          icon={<IconCheck size={19} />}
          onPress={() => {
            if (back) back();
            else go('AdminHome');
          }}>
          {pending > 0 ? `Concluir · ${pending} pendente${pending > 1 ? 's' : ''}` : 'Concluir'}
        </Button>
      </View>
    </Screen>
  );
}

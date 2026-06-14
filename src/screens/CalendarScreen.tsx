/**
 * 16. Calendário — grade do mês com aniversários (jovens + auxiliares, derivados
 * da data de nascimento) e eventos (tabela `eventos`). Toque num dia para ver o
 * que está marcado; toque num evento para editar/excluir; "Adicionar evento" cria.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import {
  useBirthdays,
  useEventos,
  todayISO,
  isoWeekday,
  MONTHS_FULL_PT,
  type Birthday,
} from '../data/repo';
import {
  AppBar,
  Avatar,
  Button,
  Card,
  CardRow,
  Chip,
  IconButton,
  Screen,
  ScreenScroll,
  SectionLabel,
  Txt,
} from '../components/ui';
import { IconCalendar, IconChevL, IconChevR, IconPlus } from '../components/Icons';

interface Cell {
  iso: string;
  day: number;
  current: boolean;
}
const pad = (n: number) => String(n).padStart(2, '0');

/** 6 semanas × 7 dias, com os dias vizinhos (fora do mês) marcados em current=false. */
function monthMatrix(year: number, month: number): Cell[] {
  const startDow = new Date(year, month - 1, 1).getDay(); // 0 = domingo
  const start = new Date(year, month - 1, 1 - startDow);
  const out: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    out.push({
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      day: d.getDate(),
      current: d.getMonth() === month - 1,
    });
  }
  return out;
}

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function Dot({ color }: { color: string }) {
  return <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />;
}

export default function CalendarScreen() {
  const t = useTheme();
  const { go, back } = useNav();
  const { birthdays } = useBirthdays();
  const { eventos } = useEventos();

  const today = todayISO();
  const [ty, tm] = today.split('-').map(Number);
  const [cursor, setCursor] = useState({ year: ty, month: tm });
  const [selected, setSelected] = useState(today);

  const cells = monthMatrix(cursor.year, cursor.month);

  // aniversários do mês exibido (por dia-do-mês) e eventos por data
  const bdayDays = new Set<number>();
  for (const b of birthdays) {
    const [, bm] = b.birth.split('/').map(Number);
    if (bm === cursor.month) bdayDays.add(Number(b.birth.slice(0, 2)));
  }
  const evIso = new Set(eventos.map((e) => e.data));

  // detalhe do dia selecionado
  const [sy, sm, sd] = selected.split('-').map(Number);
  const selBdays: Birthday[] = birthdays.filter((b) => {
    const [bd, bm] = b.birth.split('/').map(Number);
    return bd === sd && bm === sm;
  });
  const selEvents = eventos.filter((e) => e.data === selected);

  const dayLabel =
    (selected === today ? 'Hoje · ' : `${isoWeekday(selected)} · `) + `${sd} de ${MONTHS_FULL_PT[sm - 1]}`;

  function shift(delta: number) {
    setCursor((c) => {
      let mm = c.month + delta;
      let yy = c.year;
      if (mm < 1) {
        mm = 12;
        yy -= 1;
      } else if (mm > 12) {
        mm = 1;
        yy += 1;
      }
      return { year: yy, month: mm };
    });
  }

  return (
    <Screen>
      <AppBar title="Calendário" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* month grid */}
        <Card pad>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton soft accessibilityLabel="Mês anterior" onPress={() => shift(-1)}>
              <IconChevL size={20} color={t.primary} />
            </IconButton>
            <Txt weight="extrabold" size={17}>
              {MONTHS_FULL_PT[cursor.month - 1]} {cursor.year}
            </Txt>
            <IconButton soft accessibilityLabel="Próximo mês" onPress={() => shift(1)}>
              <IconChevR size={20} color={t.primary} />
            </IconButton>
          </View>

          <View style={{ flexDirection: 'row', marginTop: t.space.md }}>
            {WEEK.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Txt weight="bold" size={11.5} color={t.inkSoft}>
                  {w}
                </Txt>
              </View>
            ))}
          </View>

          <View style={{ marginTop: t.space.sm, gap: t.space.xs }}>
            {[0, 1, 2, 3, 4, 5].map((wk) => (
              <View key={wk} style={{ flexDirection: 'row', gap: t.space.xs }}>
                {cells.slice(wk * 7, wk * 7 + 7).map((cell) => {
                  const isToday = cell.iso === today;
                  const isSel = cell.iso === selected;
                  const hasBday = cell.current && bdayDays.has(cell.day);
                  const hasEvent = evIso.has(cell.iso);
                  return (
                    <Pressable
                      key={cell.iso}
                      onPress={() => setSelected(cell.iso)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSel }}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSel ? t.primary : isToday ? t.primarySoft : 'transparent',
                        },
                        pressed && !isSel && { backgroundColor: t.surface2 },
                      ]}>
                      <Txt
                        weight={isToday || isSel ? 'extrabold' : 'semibold'}
                        size={13.5}
                        color={isSel ? t.onPrimary : cell.current ? t.ink : t.inkFaint}>
                        {cell.day}
                      </Txt>
                      <View style={{ flexDirection: 'row', gap: 3, marginTop: 2, height: 5 }}>
                        {hasBday ? <Dot color={isSel ? t.onPrimary : t.gold} /> : null}
                        {hasEvent ? <Dot color={isSel ? t.onPrimary : t.primary} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: t.space.lg, justifyContent: 'center', marginTop: t.space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Dot color={t.gold} />
              <Txt weight="semibold" size={12} color={t.inkSoft}>
                Aniversário
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Dot color={t.primary} />
              <Txt weight="semibold" size={12} color={t.inkSoft}>
                Evento
              </Txt>
            </View>
          </View>
        </Card>

        {/* selected-day detail */}
        <SectionLabel>{dayLabel}</SectionLabel>

        {selBdays.length === 0 && selEvents.length === 0 ? (
          <Card pad>
            <Txt weight="semibold" color={t.inkSoft}>
              Nada marcado neste dia.
            </Txt>
          </Card>
        ) : null}

        {selBdays.length > 0 ? (
          <Card pad style={{ gap: t.space.md }}>
            {selBdays.map((b, i) => {
              const turning = sy - Number(b.birth.slice(6, 10));
              return (
                <View key={`${b.name}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
                  <Avatar name={b.name} size={40} photoUrl={b.photoUrl} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt weight="bold" size={15} numberOfLines={1}>
                      {b.name}
                    </Txt>
                    <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
                      {turning > 0 ? `Completa ${turning} ${turning === 1 ? 'ano' : 'anos'}` : 'Aniversário'}
                      {b.kind === 'auxiliar' ? ' · auxiliar' : ''}
                    </Txt>
                  </View>
                  <Chip tone="gold">Aniversário</Chip>
                </View>
              );
            })}
          </Card>
        ) : null}

        {selEvents.map((e) => (
          <CardRow key={e.id} onPress={() => go('EventForm', { id: e.id })} accessibilityLabel={`Evento ${e.title}`}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: t.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <IconCalendar size={19} color={t.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt weight="bold" size={15} numberOfLines={1}>
                {e.title}
              </Txt>
              {e.descricao ? (
                <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={2}>
                  {e.descricao}
                </Txt>
              ) : null}
            </View>
            <IconChevR size={20} color={t.ink} opacity={0.4} />
          </CardRow>
        ))}

        <Button variant="secondary" icon={<IconPlus size={19} />} onPress={() => go('EventForm', { date: selected })}>
          Adicionar evento
        </Button>
      </ScreenScroll>
    </Screen>
  );
}

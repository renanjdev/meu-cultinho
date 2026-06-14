/** 13. Histórico de Frequência — past meetings with attendance bars (real). */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useGrupos, useHistory, isoToBR } from '../data/repo';
import {
  AppBar,
  CardRow,
  Chip,
  Field,
  FilterChips,
  ProgressBar,
  Screen,
  ScreenScroll,
  Txt,
} from '../components/ui';
import { IconCalendar, IconCheck, IconX } from '../components/Icons';

export default function HistoryScreen() {
  const t = useTheme();
  const { go, back } = useNav();
  const [grp, setGrp] = useState('all');
  const { grupos } = useGrupos();
  const { rows, loading } = useHistory(grp);

  const groupOptions = [
    { value: 'all', label: 'Todos os grupos' },
    ...grupos.map((g) => ({ value: g.id, label: g.short || g.name })),
  ];

  // rows come newest-first → first = latest, last = earliest.
  const dateFrom = rows.length ? isoToBR(rows[rows.length - 1].dateISO) : '—';
  const dateTo = rows.length ? isoToBR(rows[0].dateISO) : '—';

  return (
    <Screen>
      <AppBar title="Histórico de Frequência" onBack={back} />
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Primeira reunião" value={dateFrom} editable={false} icon={<IconCalendar size={16} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Última reunião" value={dateTo} editable={false} icon={<IconCalendar size={16} />} />
          </View>
        </View>
        <FilterChips value={grp} onChange={setGrp} options={groupOptions} />
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {rows.length === 0 ? (
          <Txt color={t.inkSoft} style={{ paddingVertical: 30, textAlign: 'center' }}>
            {loading ? 'Carregando histórico…' : 'Nenhum registro neste período.'}
          </Txt>
        ) : (
          rows.map((h) => {
            const tone: 'present' | 'gold' | 'absent' = h.freq >= 85 ? 'present' : h.freq >= 70 ? 'gold' : 'absent';
            const barColor = tone === 'present' ? t.present : tone === 'gold' ? t.gold : t.absent;
            const [day, month] = h.dayMonth.split(' ');
            return (
              <CardRow key={h.id} onPress={() => go('Reports')} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      borderRadius: 14,
                      backgroundColor: t.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Txt weight="bold" size={17} color={t.primary} style={{ lineHeight: 19 }}>
                      {day}
                    </Txt>
                    <Txt weight="bold" size={10} color={t.primary} style={{ textTransform: 'uppercase' }}>
                      {month}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="bold" size={14.5} numberOfLines={1}>
                      {h.groupLabel}
                    </Txt>
                    <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                      {h.weekday} · {h.present + h.absent} jovens
                    </Txt>
                  </View>
                  <Chip tone={tone}>{h.freq}%</Chip>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconCheck size={15} color={t.present} />
                    <Txt weight="bold" size={13} color={t.present}>
                      {h.present} presentes
                    </Txt>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconX size={15} color={t.absent} />
                    <Txt weight="bold" size={13} color={t.absent}>
                      {h.absent} faltas
                    </Txt>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <ProgressBar value={h.freq} color={barColor} />
                </View>
              </CardRow>
            );
          })
        )}
      </ScreenScroll>
    </Screen>
  );
}

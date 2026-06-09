/** 13. Histórico de Frequência — past meetings with attendance bars. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { HISTORY } from '../data/seed';
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

  return (
    <Screen>
      <AppBar title="Histórico de Frequência" onBack={back} />
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Data inicial" value="01/05/2025" editable={false} icon={<IconCalendar size={16} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Data final" value="08/06/2025" editable={false} icon={<IconCalendar size={16} />} />
          </View>
        </View>
        <FilterChips
          value={grp}
          onChange={setGrp}
          options={[
            { value: 'all', label: 'Todos os grupos' },
            { value: 'g5', label: 'Moços' },
            { value: 'g6', label: 'Moças' },
            { value: 'g3', label: 'Meninos até 12' },
          ]}
        />
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {HISTORY.map((h) => {
          const tone: 'present' | 'gold' | 'absent' = h.freq >= 85 ? 'present' : h.freq >= 70 ? 'gold' : 'absent';
          const barColor = tone === 'present' ? t.present : tone === 'gold' ? t.gold : t.absent;
          const [day, month] = h.date.split(' ');
          return (
            <CardRow key={h.id} onPress={() => go('Reports')} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
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
                  <Txt weight="bold" size={14.5}>
                    {h.group}
                  </Txt>
                  <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                    {h.day} · {h.present + h.absent} jovens
                  </Txt>
                </View>
                <Chip tone={tone}>{h.freq}%</Chip>
              </View>
              <View style={{ flexDirection: 'row', gap: 14, marginTop: 11, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconCheck size={15} color={t.present} />
                  <Txt weight="bold" size={13} color={t.present}>
                    {h.present} presentes
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconX size={15} color={t.absent} />
                  <Txt weight="bold" size={13} color={t.absent}>
                    {h.absent} faltas
                  </Txt>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <ProgressBar value={h.freq} color={barColor} />
              </View>
            </CardRow>
          );
        })}
      </ScreenScroll>
    </Screen>
  );
}

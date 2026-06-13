/** 14. Relatórios — summary stats, attendance-by-group bars, rankings. */
import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import {
  AppBar,
  BottomNav,
  Card,
  IconButton,
  ProgressBar,
  Screen,
  ScreenScroll,
  SectionLabel,
  StatTile,
  Txt,
} from '../components/ui';
import {
  IconAlert,
  IconChart,
  IconCheck,
  IconClipboard,
  IconFilter,
  IconHome,
  IconSettings,
  IconStar,
  IconTrend,
  IconUsers,
  IconX,
  type IconProps,
} from '../components/Icons';

const BY_GROUP = [
  { name: 'Moças', v: 80 },
  { name: 'Meninas até 12', v: 88 },
  { name: 'Moços', v: 71 },
  { name: 'Meninos até 12', v: 76 },
  { name: 'Meninas (não leem)', v: 90 },
  { name: 'Meninos (não leem)', v: 83 },
];

function RankCard({
  title,
  icon,
  tone,
  rows,
}: {
  title: string;
  icon: ReactNode;
  tone: 'present' | 'absent';
  rows: [string, string][];
}) {
  const t = useTheme();
  const fg = tone === 'present' ? t.present : t.absent;
  const fgDeep = tone === 'present' ? t.presentDeep : t.absentDeep;
  const bg = tone === 'present' ? t.presentSoft : t.absentSoft;
  return (
    <Card pad style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </View>
        <Txt weight="bold" size={13} color={fgDeep}>
          {title}
        </Txt>
      </View>
      <View style={{ marginTop: 10, gap: 9 }}>
        {rows.map(([name, val]) => (
          <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt weight="semibold" size={12.5} numberOfLines={1} style={{ flex: 1, marginRight: 6 }}>
              {name}
            </Txt>
            <Txt weight="bold" size={12.5} color={fgDeep}>
              {val}
            </Txt>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function Reports() {
  const t = useTheme();
  const { go } = useNav();
  const { show } = useToast();
  const stat = (size: number): IconProps => ({ size });

  return (
    <Screen>
      <AppBar
        title="Relatórios"
        sub="Maio · Todos os grupos"
        right={
          <IconButton soft accessibilityLabel="Filtrar relatório" onPress={() => show('Em breve')}>
            <IconFilter size={19} color={t.primary} />
          </IconButton>
        }
      />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 11 }}>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <StatTile num="84%" label="Frequência média" tone="primary" icon={<IconTrend {...stat(18)} />} style={{ flex: 1 }} />
            <StatTile num="48" label="Jovens ativos" tone="gold" icon={<IconUsers {...stat(18)} />} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <StatTile num="162" label="Total de presenças" tone="present" icon={<IconCheck {...stat(18)} />} style={{ flex: 1 }} />
            <StatTile num="29" label="Total de faltas" tone="absent" icon={<IconX {...stat(18)} />} style={{ flex: 1 }} />
          </View>
        </View>

        <SectionLabel>Presença por grupo</SectionLabel>
        <Card pad style={{ gap: 14 }}>
          {BY_GROUP.map((g) => (
            <View key={g.name}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Txt weight="bold" size={13} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                  {g.name}
                </Txt>
                <Txt weight="bold" size={13} color={t.inkSoft}>
                  {g.v}%
                </Txt>
              </View>
              <ProgressBar value={g.v} color={g.v >= 85 ? t.present : g.v >= 70 ? t.primary : t.gold} />
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: 'row', gap: 11 }}>
          <RankCard
            title="Mais frequentes"
            tone="present"
            icon={<IconStar size={16} color={t.present} />}
            rows={[
              ['Noemi Ferreira', '95%'],
              ['Isabela Santos', '92%'],
              ['Beatriz Moraes', '91%'],
            ]}
          />
          <RankCard
            title="Mais ausentes"
            tone="absent"
            icon={<IconAlert size={16} color={t.absent} />}
            rows={[
              ['Gabriel Nunes', '42%'],
              ['Lucas Almeida', '64%'],
              ['Sofia Ribeiro', '78%'],
            ]}
          />
        </View>
      </ScreenScroll>

      <BottomNav
        active="Reports"
        onChange={(id) => go(id)}
        items={[
          { id: 'AdminHome', label: 'Início', icon: IconHome },
          { id: 'YouthList', label: 'Jovens', icon: IconUsers },
          { id: 'Attendance', label: 'Frequência', icon: IconClipboard },
          { id: 'Reports', label: 'Relatórios', icon: IconChart },
          { id: 'Settings', label: 'Ajustes', icon: IconSettings },
        ]}
      />
    </Screen>
  );
}

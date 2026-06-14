/** 14. Relatórios — summary stats, attendance-by-group bars, rankings (real). */
import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { useReports, type RankItem } from '../data/repo';
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

function RankCard({
  title,
  icon,
  tone,
  rows,
  empty,
}: {
  title: string;
  icon: ReactNode;
  tone: 'present' | 'absent';
  rows: RankItem[];
  empty: string;
}) {
  const t = useTheme();
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
        {rows.length === 0 ? (
          <Txt weight="semibold" size={12} color={t.inkSoft}>
            {empty}
          </Txt>
        ) : (
          rows.map((r) => (
            <View key={r.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt weight="semibold" size={12.5} numberOfLines={1} style={{ flex: 1, marginRight: 6 }}>
                {r.name}
              </Txt>
              <Txt weight="bold" size={12.5} color={fgDeep}>
                {r.pct}%
              </Txt>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

export default function Reports() {
  const t = useTheme();
  const { go } = useNav();
  const { show } = useToast();
  const { data, loading } = useReports();
  const stat = (size: number): IconProps => ({ size });

  const hasData = !!data && data.totalPresent + data.totalAbsent > 0;
  const sub = !data
    ? 'Carregando…'
    : `${data.reunioes} ${data.reunioes === 1 ? 'reunião' : 'reuniões'} · Todos os grupos`;

  return (
    <Screen>
      <AppBar
        title="Relatórios"
        sub={sub}
        right={
          <IconButton soft accessibilityLabel="Filtrar relatório" onPress={() => show('Em breve')}>
            <IconFilter size={19} color={t.primary} />
          </IconButton>
        }
      />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 11 }}>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <StatTile num={`${data?.avgFreq ?? 0}%`} label="Frequência média" tone="primary" icon={<IconTrend {...stat(18)} />} style={{ flex: 1 }} />
            <StatTile num={data?.activeYouth ?? 0} label="Jovens ativos" tone="gold" icon={<IconUsers {...stat(18)} />} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <StatTile num={data?.totalPresent ?? 0} label="Total de presenças" tone="present" icon={<IconCheck {...stat(18)} />} style={{ flex: 1 }} />
            <StatTile num={data?.totalAbsent ?? 0} label="Total de faltas" tone="absent" icon={<IconX {...stat(18)} />} style={{ flex: 1 }} />
          </View>
        </View>

        {!hasData ? (
          <Card pad style={{ marginTop: 16, alignItems: 'center', gap: 6, paddingVertical: 26 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <IconChart size={22} color={t.primary} />
            </View>
            <Txt weight="bold" size={15} style={{ textAlign: 'center', marginTop: 4 }}>
              {loading ? 'Carregando relatórios…' : 'Ainda sem registros'}
            </Txt>
            {!loading ? (
              <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ textAlign: 'center' }}>
                Assim que você registrar frequências, as estatísticas por grupo e os destaques aparecem aqui.
              </Txt>
            ) : null}
          </Card>
        ) : (
          <>
            <SectionLabel>Presença por grupo</SectionLabel>
            <Card pad style={{ gap: 14 }}>
              {data!.byGroup.map((g) => (
                <View key={g.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Txt weight="bold" size={13} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                      {g.name}
                    </Txt>
                    <Txt weight="bold" size={13} color={t.inkSoft}>
                      {g.freq}%
                    </Txt>
                  </View>
                  <ProgressBar value={g.freq} color={g.freq >= 85 ? t.present : g.freq >= 70 ? t.primary : t.gold} />
                </View>
              ))}
            </Card>

            <View style={{ flexDirection: 'row', gap: 11 }}>
              <RankCard
                title="Mais frequentes"
                tone="present"
                icon={<IconStar size={16} color={t.present} />}
                rows={data!.topPresent}
                empty="Sem dados ainda."
              />
              <RankCard
                title="Mais ausentes"
                tone="absent"
                icon={<IconAlert size={16} color={t.absent} />}
                rows={data!.topAbsent}
                empty="Sem dados ainda."
              />
            </View>
          </>
        )}
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

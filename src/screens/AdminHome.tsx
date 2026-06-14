/** 3. Home Admin — dashboard: summary, quick actions, today's groups. */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSession } from '../state/session';
import { useToast } from '../components/Toast';
import { useNav } from '../navigation/useNav';
import { useJovens, useGrupos, useAuxiliares } from '../data/repo';
import type { RouteName } from '../navigation/types';
import {
  Avatar,
  BottomNav,
  CardRow,
  GroupIcon,
  IconButton,
  Link,
  Screen,
  ScreenScroll,
  SectionLabel,
  StatTile,
  Txt,
  type StatTone,
} from '../components/ui';
import {
  IconBell,
  IconChart,
  IconCheckCircle,
  IconChevR,
  IconClipboard,
  IconHome,
  IconLayers,
  IconSettings,
  IconUser,
  IconUsers,
  type IconComponent,
} from '../components/Icons';

interface SummaryItem {
  num: string | number;
  label: string;
  Icon: IconComponent;
  tone: StatTone;
}
interface ActionItem {
  label: string;
  sub: string;
  Icon: IconComponent;
  to: RouteName;
  primary?: boolean;
}

const ACTIONS: ActionItem[] = [
  { label: 'Registrar frequência', sub: 'Marcar presenças de hoje', Icon: IconClipboard, to: 'Attendance', primary: true },
  { label: 'Cadastrar jovem', sub: 'Adicionar nova criança ou jovem', Icon: IconUser, to: 'YouthForm' },
  { label: 'Ver relatórios', sub: 'Estatísticas e frequência', Icon: IconChart, to: 'Reports' },
];

export default function AdminHome() {
  const t = useTheme();
  const { show } = useToast();
  const { session } = useSession();
  const { go } = useNav();
  const { jovens } = useJovens();
  const { grupos } = useGrupos();
  const { auxiliares } = useAuxiliares();
  const firstName = session?.name?.split(' ')[0] ?? 'Cooperador';

  const SUMMARY: SummaryItem[] = [
    { num: jovens.filter((j) => j.status === 'Ativo').length, label: 'Jovens ativos', Icon: IconUsers, tone: 'primary' },
    { num: auxiliares.length, label: 'Auxiliares', Icon: IconUser, tone: 'gold' },
    { num: grupos.length, label: 'Grupos', Icon: IconLayers, tone: 'present' },
    { num: '—', label: 'Última reunião', Icon: IconCheckCircle, tone: 'present' },
  ];

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 58,
          backgroundColor: t.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.line,
        }}>
        <Avatar name={session?.name ?? 'Cooperador'} size={42} />
        <View style={{ flex: 1 }}>
          <Txt weight="bold" size={18} numberOfLines={1}>
            Olá, {firstName} 👋
          </Txt>
          <Txt weight="semibold" size={12.5} color={t.inkSoft}>
            Resumo geral do Meu Cultinho
          </Txt>
        </View>
        <IconButton soft accessibilityLabel="Notificações" onPress={() => show('Em breve')}>
          <IconBell size={21} color={t.primary} />
        </IconButton>
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* summary grid */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {SUMMARY.slice(0, 2).map((s) => (
              <StatTile key={s.label} num={s.num} label={s.label} tone={s.tone} icon={<s.Icon size={18} />} style={{ flex: 1 }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {SUMMARY.slice(2, 4).map((s) => (
              <StatTile key={s.label} num={s.num} label={s.label} tone={s.tone} icon={<s.Icon size={18} />} style={{ flex: 1 }} />
            ))}
          </View>
        </View>

        {/* quick actions */}
        <SectionLabel>Ações rápidas</SectionLabel>
        <View style={{ gap: 12 }}>
          {ACTIONS.map((a) => (
            <CardRow
              key={a.label}
              onPress={() => go(a.to)}
              style={a.primary ? { backgroundColor: t.primary, borderColor: t.primary, ...t.shadowFab } : undefined}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: a.primary ? 'rgba(255,255,255,0.18)' : t.primarySoft,
                }}>
                <a.Icon size={a.primary ? 22 : 20} color={a.primary ? t.onPrimary : t.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt weight="bold" size={15.5} color={a.primary ? t.onPrimary : t.ink}>
                  {a.label}
                </Txt>
                <Txt weight="semibold" size={12.5} color={a.primary ? 'rgba(255,255,255,0.88)' : t.inkSoft}>
                  {a.sub}
                </Txt>
              </View>
              <IconChevR size={20} color={a.primary ? t.onPrimary : t.ink} opacity={0.5} />
            </CardRow>
          ))}
        </View>

        {/* groups today */}
        <SectionLabel action={<Link onPress={() => go('GroupList')}>Ver todos</Link>}>Grupos de hoje</SectionLabel>
        <View style={{ gap: 12 }}>
          {grupos.slice(0, 3).map((g) => (
            <CardRow key={g.id} onPress={() => go('Attendance', { group: g.id })}>
              <GroupIcon icon={g.icon} />
              <View style={{ flex: 1 }}>
                <Txt weight="bold" size={14.5} numberOfLines={1}>
                  {g.name}
                </Txt>
                <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
                  {g.count} jovens · {g.auxName}
                </Txt>
              </View>
            </CardRow>
          ))}
        </View>
      </ScreenScroll>

      <BottomNav
        active="AdminHome"
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

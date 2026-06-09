/** 5. Lista de Jovens — search + group/status filters, role-aware nav. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../hooks/useAuth';
import { useNav } from '../navigation/useNav';
import { useYouthStore } from '../state/youthStore';
import { GROUPS, groupShort } from '../data/seed';
import {
  AppBar,
  Avatar,
  BottomNav,
  CardRow,
  Fab,
  FilterChips,
  Screen,
  ScreenScroll,
  SearchBar,
  StatusChip,
  Txt,
  type Option,
} from '../components/ui';
import {
  IconChart,
  IconChevR,
  IconClipboard,
  IconHome,
  IconSettings,
  IconUsers,
} from '../components/Icons';

export default function YouthList() {
  const t = useTheme();
  const { session } = useAuth();
  const isAux = session?.role === 'auxiliar';
  const { go, back } = useNav();
  const all = useYouthStore();
  const [q, setQ] = useState('');
  const [grp, setGrp] = useState('all');
  const [status, setStatus] = useState('all');

  const groupOpts: Option[] = [
    { value: 'all', label: 'Todos os grupos' },
    ...GROUPS.map((g) => ({ value: g.id, label: g.short })),
  ];

  const list = all.filter(
    (j) =>
      (grp === 'all' || j.group === grp) &&
      (status === 'all' || j.status === status) &&
      j.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Screen>
      <AppBar
        title="Jovens e Menores"
        sub={`${all.length} cadastrados`}
        onBack={isAux ? back : undefined}
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, gap: 8 }}>
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por nome..." />
        <FilterChips options={groupOpts} value={grp} onChange={setGrp} />
        <FilterChips
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'Ativo', label: 'Ativos' },
            { value: 'Inativo', label: 'Inativos' },
          ]}
        />
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 96 }}>
        {list.length === 0 ? (
          <Txt weight="semibold" color={t.inkFaint} style={{ textAlign: 'center', padding: 30 }}>
            Nenhum jovem encontrado.
          </Txt>
        ) : null}
        {list.map((j) => (
          <CardRow key={j.id} onPress={() => go('YouthDetail', { id: j.id })}>
            <Avatar name={j.name} size={48} />
            <View style={{ flex: 1 }}>
              <Txt weight="bold" size={15} numberOfLines={1}>
                {j.name}
              </Txt>
              <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
                {j.age} anos · {groupShort(j.group)}
              </Txt>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                <StatusChip kind={j.status} />
                <StatusChip kind={j.last} />
              </View>
            </View>
            <IconChevR size={20} color={t.ink} opacity={0.4} />
          </CardRow>
        ))}
      </ScreenScroll>

      <Fab label="Novo Jovem" onPress={() => go('YouthForm')} hasBottomNav={!isAux} />

      {!isAux ? (
        <BottomNav
          active="YouthList"
          onChange={(id) => go(id)}
          items={[
            { id: 'AdminHome', label: 'Início', icon: IconHome },
            { id: 'YouthList', label: 'Jovens', icon: IconUsers },
            { id: 'Attendance', label: 'Frequência', icon: IconClipboard },
            { id: 'Reports', label: 'Relatórios', icon: IconChart },
            { id: 'Settings', label: 'Ajustes', icon: IconSettings },
          ]}
        />
      ) : null}
    </Screen>
  );
}

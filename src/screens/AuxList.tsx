/** 8. Lista de Auxiliares — search + roster of helpers. */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useAuxiliares } from '../data/repo';
import { AppBar, Avatar, CardRow, Chip, Fab, Screen, ScreenScroll, SearchBar, StatusChip, Txt } from '../components/ui';
import { IconWhats } from '../components/Icons';

export default function AuxList() {
  const t = useTheme();
  const { go, back } = useNav();
  const [q, setQ] = useState('');
  const { auxiliares } = useAuxiliares();
  const list = auxiliares.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Screen>
      <AppBar title="Auxiliares" sub={`${auxiliares.length} cadastrados`} onBack={back} />
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line }}>
        <SearchBar value={q} onChange={setQ} placeholder="Buscar auxiliar..." />
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 96 }}>
        {list.length === 0 ? (
          <Txt color={t.inkSoft} style={{ paddingVertical: 30, textAlign: 'center' }}>
            Nenhum auxiliar encontrado.
          </Txt>
        ) : null}
        {list.map((a) => {
          const roleLabel = a.role === 'cooperador' ? 'Cooperador' : 'Auxiliar';
          return (
          <CardRow key={a.id} accessibilityLabel={a.name + ', ' + roleLabel + ', ' + a.status} onPress={() => go('AuxForm')}>
            <Avatar name={a.name} size={48} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" size={15} numberOfLines={1}>
                    {a.name}
                  </Txt>
                </View>
                {a.role === 'cooperador' ? <Chip tone="gold">Cooperador</Chip> : null}
              </View>
              <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ marginTop: 1 }} numberOfLines={1}>
                {roleLabel}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <IconWhats size={14} color={t.inkSoft} />
                <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                  {a.phone}
                </Txt>
              </View>
            </View>
            <StatusChip kind={a.status} />
          </CardRow>
          );
        })}
      </ScreenScroll>

      <Fab label="Novo Auxiliar" onPress={() => go('AuxForm')} />
    </Screen>
  );
}

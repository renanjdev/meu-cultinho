/** 4. Home Auxiliar — alert, quick actions, the groups they're responsible for. */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSession } from '../state/session';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { useGrupos } from '../data/repo';
import {
  Avatar,
  BottomNav,
  Button,
  Card,
  CardRow,
  GroupIcon,
  IconButton,
  Screen,
  ScreenScroll,
  SectionLabel,
  Txt,
} from '../components/ui';
import {
  IconAlert,
  IconBell,
  IconCalendar,
  IconChevR,
  IconClipboard,
  IconClock,
  IconHome,
  IconPlus,
  IconUser,
  IconUsers,
} from '../components/Icons';

export default function AuxHome() {
  const t = useTheme();
  const { session } = useSession();
  const { go } = useNav();
  const { show } = useToast();
  const firstName = session?.name?.split(' ')[0] ?? 'Auxiliar';

  const { grupos } = useGrupos();
  const myGroups = grupos.slice(0, 2); // placeholder: auxiliar's assigned groups

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
        <Avatar name={session?.name ?? 'Auxiliar'} size={42} photoUrl={session?.photoUrl} />
        <View style={{ flex: 1 }}>
          <Txt weight="bold" size={18} numberOfLines={1}>
            Olá, {firstName} 👋
          </Txt>
          <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
            Seus grupos sob responsabilidade
          </Txt>
        </View>
        <IconButton soft accessibilityLabel="Notificações" onPress={() => show('Em breve')}>
          <IconBell size={21} color={t.primary} />
        </IconButton>
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* alert */}
        <View
          style={[
            { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: t.goldSoft, borderRadius: t.radiusCard, padding: 16 },
            t.shadowCard,
          ]}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(239,176,42,0.20)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconAlert size={22} color={t.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" size={14.5} color={t.goldDeep}>
              Frequência pendente
            </Txt>
            <Txt weight="semibold" size={13} color={t.goldDeep} style={{ lineHeight: 19, marginTop: 2 }}>
              Há jovens sem frequência registrada na última reunião.
            </Txt>
            <Button sm bg={t.gold} fg={t.ink} style={{ marginTop: 10 }} onPress={() => go('Attendance')}>
              Registrar agora
            </Button>
          </View>
        </View>

        <SectionLabel>Ações rápidas</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cadastrar jovem"
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            onPress={() => go('YouthForm')}>
            <Card pad style={{ gap: 8 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: t.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconPlus size={20} color={t.primary} />
              </View>
              <Txt weight="bold" size={14}>
                Cadastrar jovem
              </Txt>
            </Card>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver jovens"
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            onPress={() => go('YouthList')}>
            <Card pad style={{ gap: 8 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: t.goldSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconUsers size={20} color={t.gold} />
              </View>
              <Txt weight="bold" size={14}>
                Ver jovens
              </Txt>
            </Card>
          </Pressable>
        </View>

        <CardRow onPress={() => go('Calendar')} accessibilityLabel="Calendário">
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: t.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
            <IconCalendar size={20} color={t.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" size={15.5} numberOfLines={1}>
              Calendário
            </Txt>
            <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
              Aniversários e eventos
            </Txt>
          </View>
          <IconChevR size={20} color={t.ink} opacity={0.5} />
        </CardRow>

        <SectionLabel>Meus grupos</SectionLabel>
        <View style={{ gap: 12 }}>
          {myGroups.map((g) => (
            <Card key={g.id} pad>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <GroupIcon icon={g.icon} />
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" size={15.5} numberOfLines={1}>
                    {g.name}
                  </Txt>
                  <Txt weight="semibold" size={12.5} color={t.inkSoft} numberOfLines={1}>
                    {g.count} jovens
                  </Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <IconClock size={15} color={t.inkSoft} />
                <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                  Última frequência: —
                </Txt>
              </View>
              <Button variant="secondary" icon={<IconClipboard size={18} />} style={{ marginTop: 12 }} onPress={() => go('Attendance', { group: g.id })}>
                Registrar presença
              </Button>
            </Card>
          ))}
        </View>
      </ScreenScroll>

      <BottomNav
        active="AuxHome"
        onChange={(id) => go(id)}
        items={[
          { id: 'AuxHome', label: 'Início', icon: IconHome },
          { id: 'Attendance', label: 'Frequência', icon: IconClipboard },
          { id: 'History', label: 'Histórico', icon: IconClock },
          { id: 'Settings', label: 'Perfil', icon: IconUser },
        ]}
      />
    </Screen>
  );
}

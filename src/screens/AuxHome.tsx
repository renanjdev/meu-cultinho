/** 4. Home Auxiliar — alert, quick actions, the groups they're responsible for. */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { GROUPS } from '../data/seed';
import {
  Avatar,
  BottomNav,
  Button,
  Card,
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
  IconClipboard,
  IconClock,
  IconHome,
  IconPlus,
  IconUser,
  IconUsers,
} from '../components/Icons';

const GOLD_INK = '#a06f10';

export default function AuxHome() {
  const t = useTheme();
  const { go } = useNav();

  const myGroups = [GROUPS[4], GROUPS[2]]; // Moços, Meninos até 12

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          minHeight: 58,
          backgroundColor: t.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.line,
        }}>
        <Avatar name="Lucas Souza" size={42} />
        <View style={{ flex: 1 }}>
          <Txt weight="bold" size={18}>
            Olá, Lucas 👋
          </Txt>
          <Txt weight="semibold" size={12.5} color={t.inkSoft}>
            Seus grupos sob responsabilidade
          </Txt>
        </View>
        <IconButton soft>
          <IconBell size={21} color={t.primary} />
        </IconButton>
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* alert */}
        <View
          style={[
            { flexDirection: 'row', gap: 13, alignItems: 'flex-start', backgroundColor: t.goldSoft, borderRadius: t.radiusCard, padding: 16 },
            t.shadowCard,
          ]}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(217,154,43,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconAlert size={22} color={t.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" size={14.5} color={GOLD_INK}>
              Frequência pendente
            </Txt>
            <Txt weight="semibold" size={13} color={GOLD_INK} style={{ lineHeight: 19, marginTop: 2 }}>
              Há jovens sem frequência registrada na última reunião.
            </Txt>
            <Button sm bg={t.gold} fg="#fff" style={{ marginTop: 10 }} onPress={() => go('Attendance')}>
              Registrar agora
            </Button>
          </View>
        </View>

        <SectionLabel>Ações rápidas</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 11 }}>
          <Pressable style={{ flex: 1 }} onPress={() => go('YouthForm')}>
            <Card pad style={{ gap: 9 }}>
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
          <Pressable style={{ flex: 1 }} onPress={() => go('YouthList')}>
            <Card pad style={{ gap: 9 }}>
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

        <SectionLabel>Meus grupos</SectionLabel>
        <View style={{ gap: 14 }}>
          {myGroups.map((g) => (
            <Card key={g.id} pad>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                <GroupIcon icon={g.icon} />
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" size={15.5}>
                    {g.name}
                  </Txt>
                  <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                    {g.count} jovens
                  </Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <IconClock size={15} color={t.inkSoft} />
                <Txt weight="semibold" size={12.5} color={t.inkSoft}>
                  Última frequência: {g.last}
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

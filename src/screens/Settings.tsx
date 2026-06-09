/** 15. Configurações — profile, theme switcher, congregation, app, logout. */
import React, { type ComponentType } from 'react';
import { Pressable, View } from 'react-native';
import { useApp, useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../hooks/useAuth';
import { useNav } from '../navigation/useNav';
import { signOutUser } from '../services/auth';
import { AUX } from '../data/seed';
import type { ThemeName } from '../theme/tokens';
import {
  AppBar,
  Avatar,
  BottomNav,
  Card,
  Chip,
  FilterChips,
  IconButton,
  Screen,
  ScreenScroll,
  SectionLabel,
  Txt,
} from '../components/ui';
import {
  IconBell,
  IconBook,
  IconChart,
  IconChevR,
  IconClipboard,
  IconClock,
  IconDownload,
  IconEdit,
  IconHome,
  IconLayers,
  IconLogout,
  IconSettings,
  IconShield,
  IconUser,
  IconUsers,
  type IconProps,
} from '../components/Icons';

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'sereno', label: 'Sereno' },
  { value: 'jardim', label: 'Jardim' },
  { value: 'aconchego', label: 'Aconchego' },
];

export default function Settings() {
  const t = useTheme();
  const { themeName, setThemeName } = useApp();
  const { session } = useAuth();
  const isAux = session?.role === 'auxiliar';
  const { go } = useNav();
  const me = isAux ? AUX[1] : AUX[0];

  const Item = ({
    Icon,
    label,
    value,
    onPress,
    danger,
  }: {
    Icon: ComponentType<IconProps>;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: t.line },
        pressed && { opacity: 0.6 },
      ]}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: danger ? t.absentSoft : t.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon size={19} color={danger ? t.absent : t.primary} />
      </View>
      <Txt weight="bold" size={14.5} color={danger ? t.absent : t.ink} style={{ flex: 1 }}>
        {label}
      </Txt>
      {value ? (
        <Txt weight="semibold" size={13} color={t.inkSoft}>
          {value}
        </Txt>
      ) : null}
      {!danger ? <IconChevR size={18} color={t.ink} opacity={0.4} /> : null}
    </Pressable>
  );

  return (
    <Screen>
      <AppBar title="Configurações" />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* profile */}
        <Card pad style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={me.name} size={58} />
          <View style={{ flex: 1 }}>
            <Txt weight="bold" size={17}>
              {me.name}
            </Txt>
            <Txt weight="semibold" size={13} color={t.inkSoft}>
              {me.group}
            </Txt>
            <View style={{ marginTop: 6 }}>
              <Chip tone={me.role === 'Administrador' ? 'gold' : 'primary'}>{me.role}</Chip>
            </View>
          </View>
          <IconButton soft onPress={() => go('AuxForm')}>
            <IconEdit size={18} color={t.primary} />
          </IconButton>
        </Card>

        {/* theme switcher — replaces the design tool's Tweaks panel */}
        <SectionLabel>Identidade visual</SectionLabel>
        <FilterChips options={THEME_OPTIONS} value={themeName} onChange={(v) => setThemeName(v as ThemeName)} />

        <SectionLabel>Congregação</SectionLabel>
        <Card style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
          <Item Icon={IconBook} label="Dados da congregação" value="Central" />
          <Item Icon={IconLayers} label="Grupos" value="6" onPress={() => go('GroupList')} />
          <Item Icon={IconUser} label="Auxiliares" value="5" onPress={() => go('AuxList')} />
        </Card>

        <SectionLabel>Aplicativo</SectionLabel>
        <Card style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
          <Item Icon={IconBell} label="Preferências e notificações" />
          <Item Icon={IconDownload} label="Backup e exportação" value="Em breve" />
          <Item Icon={IconShield} label="Segurança" />
        </Card>

        <Card style={{ paddingHorizontal: 14, paddingVertical: 4, marginTop: 4 }}>
          <Item Icon={IconLogout} label="Sair" danger onPress={() => { void signOutUser(); }} />
        </Card>
        <Txt weight="semibold" size={12} color={t.inkFaint} style={{ textAlign: 'center', marginTop: 4 }}>
          Meu Cultinho · versão 1.0
        </Txt>
      </ScreenScroll>

      {isAux ? (
        <BottomNav
          active="Settings"
          onChange={(id) => go(id)}
          items={[
            { id: 'AuxHome', label: 'Início', icon: IconHome },
            { id: 'Attendance', label: 'Frequência', icon: IconClipboard },
            { id: 'History', label: 'Histórico', icon: IconClock },
            { id: 'Settings', label: 'Perfil', icon: IconUser },
          ]}
        />
      ) : (
        <BottomNav
          active="Settings"
          onChange={(id) => go(id)}
          items={[
            { id: 'AdminHome', label: 'Início', icon: IconHome },
            { id: 'YouthList', label: 'Jovens', icon: IconUsers },
            { id: 'Attendance', label: 'Frequência', icon: IconClipboard },
            { id: 'Reports', label: 'Relatórios', icon: IconChart },
            { id: 'Settings', label: 'Ajustes', icon: IconSettings },
          ]}
        />
      )}
    </Screen>
  );
}

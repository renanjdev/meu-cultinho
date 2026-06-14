/** 15. Configurações — profile, theme switcher, congregation, app, logout. */
import React, { useState, type ComponentType } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSession } from '../state/session';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { pickAndUploadPhoto } from '../data/photos';
import { updatePhotoUrl } from '../data/repo';
import {
  AppBar,
  Avatar,
  BottomNav,
  Card,
  Chip,
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
  IconPlus,
  IconShield,
  IconUser,
  IconUsers,
  type IconProps,
} from '../components/Icons';

export default function Settings() {
  const t = useTheme();
  const { session, signOut, refresh } = useSession();
  const { show } = useToast();
  const isAux = session?.role === 'auxiliar';
  const { go } = useNav();
  const roleLabel = isAux ? 'Auxiliar' : 'Cooperador';
  const [photoBusy, setPhotoBusy] = useState(false);

  const changePhoto = async () => {
    if (!session || photoBusy) return;
    setPhotoBusy(true);
    try {
      const url = await pickAndUploadPhoto('auxiliares', session.userId);
      if (url) {
        await updatePhotoUrl('auxiliares', session.userId, url);
        await refresh();
        show('Foto atualizada');
      }
    } catch (e) {
      console.error('[foto perfil]', e);
      show('Não foi possível enviar a foto.');
    } finally {
      setPhotoBusy(false);
    }
  };

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
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: t.line },
        pressed && onPress && { opacity: 0.6 },
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
      <Txt weight="bold" size={14.5} color={danger ? t.absentDeep : t.ink} style={{ flex: 1 }}>
        {label}
      </Txt>
      {value ? (
        <Txt weight="semibold" size={13} color={t.inkSoft}>
          {value}
        </Txt>
      ) : null}
      {!danger && onPress ? <IconChevR size={18} color={t.ink} opacity={0.4} /> : null}
    </Pressable>
  );

  return (
    <Screen>
      <AppBar title="Configurações" />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        {/* profile */}
        <Card pad style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={changePhoto}
            disabled={photoBusy}
            accessibilityRole="button"
            accessibilityLabel="Trocar foto do perfil">
            <Avatar name={session?.name ?? ''} size={58} photoUrl={session?.photoUrl} />
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: t.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: t.surface,
              }}>
              {photoBusy ? (
                <ActivityIndicator size="small" color={t.onPrimary} />
              ) : (
                <IconPlus size={12} color={t.onPrimary} />
              )}
            </View>
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt weight="bold" size={17} numberOfLines={1}>
              {session?.name ?? ''}
            </Txt>
            <Txt weight="semibold" size={13} color={t.inkSoft} numberOfLines={1}>
              {isAux ? 'Auxiliar' : 'Cooperador de jovens e menores'}
            </Txt>
            <View style={{ marginTop: 6 }}>
              <Chip tone={isAux ? 'primary' : 'gold'}>{roleLabel}</Chip>
            </View>
          </View>
          <IconButton soft onPress={() => go('AuxForm')} accessibilityLabel="Editar perfil">
            <IconEdit size={18} color={t.primary} />
          </IconButton>
        </Card>

        <SectionLabel>Congregação</SectionLabel>
        <Card style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <Item Icon={IconBook} label="Dados da congregação" value="Central" />
          <Item Icon={IconLayers} label="Grupos" value="6" onPress={() => go('GroupList')} />
          <Item Icon={IconUser} label="Auxiliares" value="5" onPress={() => go('AuxList')} />
        </Card>

        <SectionLabel>Aplicativo</SectionLabel>
        <Card style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <Item Icon={IconBell} label="Preferências e notificações" />
          <Item Icon={IconDownload} label="Backup e exportação" value="Em breve" />
          <Item Icon={IconShield} label="Segurança" />
        </Card>

        <Card style={{ paddingHorizontal: 16, paddingVertical: 4, marginTop: 4 }}>
          <Item Icon={IconLogout} label="Sair" danger onPress={() => { void signOut(); }} />
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

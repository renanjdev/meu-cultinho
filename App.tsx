/**
 * App.tsx — Meu Cultinho root.
 * Loads the three theme font families, then mounts the native-stack navigator
 * (every screen draws its own app bar, so the stack header is hidden).
 */
import React, { type ReactNode } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, type Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';

import { AppProvider, useTheme } from './src/theme/ThemeProvider';
import { SessionProvider, useSession } from './src/state/session';
import { ToastProvider } from './src/components/Toast';
import { LogoMark } from './src/components/ui';
import type { RootStackParamList } from './src/navigation/types';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AuxSignup from './src/screens/AuxSignup';
import AdminHome from './src/screens/AdminHome';
import AuxHome from './src/screens/AuxHome';
import YouthList from './src/screens/YouthList';
import YouthForm from './src/screens/YouthForm';
import YouthDetail from './src/screens/YouthDetail';
import AuxList from './src/screens/AuxList';
import AuxForm from './src/screens/AuxForm';
import GroupList from './src/screens/GroupList';
import GroupForm from './src/screens/GroupForm';
import Attendance from './src/screens/Attendance';
import HistoryScreen from './src/screens/HistoryScreen';
import Reports from './src/screens/Reports';
import CalendarScreen from './src/screens/CalendarScreen';
import EventForm from './src/screens/EventForm';
import InviteAux from './src/screens/InviteAux';
import Settings from './src/screens/Settings';
import InstallGate from './src/screens/InstallGate';

// Anel de foco de teclado (web). `:focus-visible` só dispara na navegação por
// teclado (Tab), então fica invisível no toque/mouse e visível para quem precisa
// — fechando o gap de WCAG 2.4.7 nos Pressables do react-native-web de uma vez.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const ID = 'cultinho-focus-styles';
  if (!document.getElementById(ID)) {
    const el = document.createElement('style');
    el.id = ID;
    el.textContent =
      '[role="button"]:focus-visible,[role="radio"]:focus-visible,[role="tab"]:focus-visible,' +
      '[role="link"]:focus-visible,[role="checkbox"]:focus-visible,[role="switch"]:focus-visible,' +
      'input:focus-visible,textarea:focus-visible{outline:2px solid #5b6ce0!important;outline-offset:2px!important}';
    document.head.appendChild(el);
  }
}

// Link de convite: /?aux=CODIGO abre direto no autocadastro de auxiliar.
const HAS_INVITE =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('aux');

// PWA: no celular o app só roda instalado (tela cheia, sem a barra do navegador).
// Liberam o uso no navegador: PWA já instalado (standalone) e computador (desktop).
// O link de convite (?aux=) é tratado à parte (ver App()), senão o auxiliar não
// conseguiria se cadastrar — depois de instalar o app abre em "/" sem o código,
// e no iPhone o app instalado nem compartilha o armazenamento do Safari.
type WebGate =
  | { blocked: false }
  | { blocked: true; platform: 'ios' | 'android'; inApp: boolean; iosNeedsSafari: boolean };

function detectWebGate(): WebGate {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { blocked: false };
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  const mm = typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null;
  const standalone =
    nav.standalone === true ||
    !!(
      mm &&
      (mm('(display-mode: standalone)').matches ||
        mm('(display-mode: fullscreen)').matches ||
        mm('(display-mode: minimal-ui)').matches)
    );
  if (standalone) return { blocked: false };

  const ua = nav.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi/i.test(ua);
  if (!isMobile) return { blocked: false }; // desktop: liberado (decisão do usuário)

  // WKWebView do iOS (navegador embutido de WhatsApp e apps em geral) não traz o
  // token "Safari/" nem é Chrome/Firefox/Edge/Opera do iOS — tratamos como in-app
  // (lá os passos do "Compartilhar" não oferecem "Adicionar à Tela de Início").
  const iosInApp = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) && !/Safari\//.test(ua);
  const inApp =
    iosInApp || /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|MicroMessenger|; ?wv\)/i.test(ua);
  const iosNeedsSafari = isIOS && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return { blocked: true, platform: isIOS ? 'ios' : 'android', inApp, iosNeedsSafari };
}

const WEB_GATE = detectWebGate();

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
      <LogoMark size={104} />
    </View>
  );
}

function useNavTheme(): NavTheme {
  const t = useTheme();
  return {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: t.bg, card: t.surface, primary: t.primary, text: t.ink, border: t.line },
  };
}

// The full set of in-app screens, shared by the signed-in navigator. Kept as a
// function (not a component) so the same <Stack.Screen> list renders inside a
// single Stack.Navigator without an extra wrapper element.
function appScreens() {
  return (
    <>
      <Stack.Screen name="AdminHome" component={AdminHome} />
      <Stack.Screen name="AuxHome" component={AuxHome} />
      <Stack.Screen name="YouthList" component={YouthList} />
      <Stack.Screen name="YouthForm" component={YouthForm} />
      <Stack.Screen name="YouthDetail" component={YouthDetail} />
      <Stack.Screen name="AuxList" component={AuxList} />
      <Stack.Screen name="AuxForm" component={AuxForm} />
      <Stack.Screen name="InviteAux" component={InviteAux} />
      <Stack.Screen name="GroupList" component={GroupList} />
      <Stack.Screen name="GroupForm" component={GroupForm} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="EventForm" component={EventForm} />
      <Stack.Screen name="Settings" component={Settings} />
    </>
  );
}

// Signed-out: splash + login.
function AuthNavigator() {
  const t = useTheme();
  const navTheme = useNavTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={HAS_INVITE ? 'AuxSignup' : 'Splash'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AuxSignup" component={AuxSignup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Signed-in: the in-app screens, starting at the home for the user's role
// (cooperador → AdminHome, auxiliar → AuxHome).
function AppNavigator({ role }: { role: 'cooperador' | 'auxiliar' }) {
  const t = useTheme();
  const navTheme = useNavTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={role === 'auxiliar' ? 'AuxHome' : 'AdminHome'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: t.bg } }}>
        {appScreens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Auth gate: Supabase session decides which navigator to mount.
function Gate() {
  const { session, loading } = useSession();
  if (loading) return <BootScreen />;
  if (!session) return <AuthNavigator />;
  return <AppNavigator role={session.role} />;
}

/**
 * On web (the browser preview), center the app inside a phone-sized bezel so it
 * reads as a mobile device. On a real Android device this is a no-op.
 */
function AppFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return <WebPhoneFrame>{children}</WebPhoneFrame>;
}

function WebPhoneFrame({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();

  // Phone browsers (the primary target): fill the viewport.
  if (width < 600) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  // Desktop / tablet: center a phone-width column. No transform and no fixed
  // height — it flexes to any viewport, so it can never clip or mis-scale.
  return (
    <View style={{ flex: 1, backgroundColor: '#e7ebf2', alignItems: 'center' }}>
      <View style={{ flex: 1, width: 440, maxWidth: '100%', backgroundColor: '#fff', overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  const ready = fontsLoaded || !!fontError;

  // Portão de instalação (celular + navegador). O convite (?aux=) passa direto.
  // Calculado num `if` sobre WEB_GATE.blocked para o TS estreitar o tipo.
  let content: ReactNode;
  if (WEB_GATE.blocked && !HAS_INVITE) {
    content = ready ? (
      <InstallGate
        platform={WEB_GATE.platform}
        inApp={WEB_GATE.inApp}
        iosNeedsSafari={WEB_GATE.iosNeedsSafari}
      />
    ) : (
      <BootScreen />
    );
  } else {
    content = (
      <SessionProvider>
        <ToastProvider>{ready ? <Gate /> : <BootScreen />}</ToastProvider>
      </SessionProvider>
    );
  }

  return (
    <AppFrame>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          {content}
        </AppProvider>
      </SafeAreaProvider>
    </AppFrame>
  );
}

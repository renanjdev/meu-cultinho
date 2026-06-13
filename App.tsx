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
import { ToastProvider } from './src/components/Toast';
import { LogoMark } from './src/components/ui';
import type { RootStackParamList } from './src/navigation/types';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
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
import Settings from './src/screens/Settings';

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
      <Stack.Screen name="GroupList" component={GroupList} />
      <Stack.Screen name="GroupForm" component={GroupForm} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Settings" component={Settings} />
    </>
  );
}

// One native-stack navigator holds the whole prototype: Splash → Login → the
// 13 in-app screens. Login navigates to a home by role (no real auth); see
// LoginScreen and the role state in ThemeProvider.
function RootNavigator() {
  const t = useTheme();
  const navTheme = useNavTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {appScreens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
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

  return (
    <AppFrame>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <ToastProvider>{ready ? <RootNavigator /> : <BootScreen />}</ToastProvider>
        </AppProvider>
      </SafeAreaProvider>
    </AppFrame>
  );
}

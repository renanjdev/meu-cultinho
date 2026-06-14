/** 1. Splash — tap anywhere to continue to Login. */
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { LogoMark, Txt } from '../components/ui';

function Dot({ delay }: { delay: number }) {
  const t = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, v]);
  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 99,
        backgroundColor: t.primary,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
      }}
    />
  );
}

export default function SplashScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { go } = useNav();
  return (
    <Pressable
      onPress={() => go('Login')}
      accessibilityRole="button"
      accessibilityLabel="Toque para continuar"
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient
        colors={t.gradientSplash}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 32,
        }}>
        <View style={{ flex: 1 }} />
        <LogoMark size={104} />
        <Txt weight="bold" numberOfLines={1} style={{ fontSize: 34, marginTop: 24 }}>
          Meu Cultinho
        </Txt>
        <Txt
          weight="semibold"
          size={15.5}
          color={t.inkSoft}
          style={{ textAlign: 'center', lineHeight: 23, marginTop: 12, maxWidth: 280 }}>
          Cuidado e organização para a reunião de jovens e menores
        </Txt>
        <View style={{ flex: 1 }} />
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Dot delay={0} />
          <Dot delay={200} />
          <Dot delay={400} />
        </View>
        <Txt weight="semibold" size={13} color={t.inkSoft} style={{ marginBottom: 8 }}>
          Toque para continuar
        </Txt>
      </LinearGradient>
    </Pressable>
  );
}

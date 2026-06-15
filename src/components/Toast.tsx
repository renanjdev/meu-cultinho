/**
 * components/Toast.tsx — lightweight app-wide toast.
 *
 * Lets placeholder controls (notification bell, report filter, attendance note)
 * give honest feedback ("Em breve") instead of reading as dead buttons, and is
 * reusable for confirmations and errors. Wrap the app in <ToastProvider> and call
 * useToast().show('...', 'error') anywhere below it. Tone picks icon/color so a
 * failure não aparece com o ícone de sucesso.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Txt } from './ui';
import { IconAlert, IconCheckCircle, IconXCircle } from './Icons';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<ToastTone>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string, t2: ToastTone = 'success') => {
      setMessage(msg);
      setTone(t2);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: false }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: false }).start(
          () => setMessage(null),
        );
      }, 2200);
    },
    [opacity],
  );

  // ícones têm contraste de sobra sobre o fundo escuro (t.ink) do toast
  const Icon = tone === 'error' ? IconXCircle : tone === 'info' ? IconAlert : IconCheckCircle;
  const iconColor = tone === 'error' ? t.absent : tone === 'info' ? t.gold : t.present;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message !== null ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 96 + insets.bottom,
            alignItems: 'center',
            opacity,
          }}>
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space.sm,
                maxWidth: '92%',
                backgroundColor: t.ink,
                paddingVertical: t.space.md,
                paddingHorizontal: t.space.lg,
                borderRadius: 999,
              },
              t.shadowPop,
            ]}>
            <Icon size={18} color={iconColor} />
            <Txt weight="bold" size={13.5} color={t.onPrimary} style={{ flexShrink: 1 }}>
              {message}
            </Txt>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

/**
 * theme/ThemeProvider.tsx — app-wide theme context.
 *
 * Replaces the prototype's [data-theme] attribute. The Tweaks panel from the
 * design tool is gone; theme selection now lives in the Configurações screen.
 * The signed-in user's role is provided by `useAuth`, not this context.
 */
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_THEME, THEMES, type Theme, type ThemeName } from './tokens';

interface AppContextValue {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);

  const value = useMemo<AppContextValue>(
    () => ({ theme: THEMES[themeName], themeName, setThemeName }),
    [themeName],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function useTheme(): Theme {
  return useApp().theme;
}

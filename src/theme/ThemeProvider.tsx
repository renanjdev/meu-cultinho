/**
 * theme/ThemeProvider.tsx — app-wide theme context.
 *
 * The app ships a single visual identity (Aconchego); there is no theme
 * switching. The signed-in user's role/session lives in state/session.tsx.
 */
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_THEME, THEMES, type Theme } from './tokens';

interface AppContextValue {
  theme: Theme;
}

const AppContext = createContext<AppContextValue | null>(null);

const THEME = THEMES[DEFAULT_THEME];

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AppContextValue>(() => ({ theme: THEME }), []);
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

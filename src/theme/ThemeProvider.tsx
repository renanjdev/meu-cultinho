/**
 * theme/ThemeProvider.tsx — app-wide theme + role context.
 *
 * Replaces the prototype's [data-theme] attribute. The app ships a single
 * visual identity (Aconchego), so there is no theme switching.
 *
 * This is a front-end-only prototype (web app, mock data), so the user's role
 * is plain client state set at login — mirroring the prototype's go() that set
 * the role when navigating to a home. Real auth (Firebase) is deferred to a
 * later phase and intentionally kept out of the runtime path.
 */
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_THEME, THEMES, type Theme } from './tokens';

export type Role = 'admin' | 'auxiliar';

interface AppContextValue {
  theme: Theme;
  role: Role;
  setRole: (role: Role) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Single shipped identity (Aconchego) — resolved once.
const THEME = THEMES[DEFAULT_THEME];

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');

  const value = useMemo<AppContextValue>(
    () => ({ theme: THEME, role, setRole }),
    [role],
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

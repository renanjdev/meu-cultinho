/**
 * Meu Cultinho — design tokens.
 *
 * The web prototype expressed these as CSS custom properties under
 * [data-theme="..."]. React Native has no CSS variables, so the theme is a
 * plain object consumed through useTheme(). Colors, radii, fonts and shadow
 * presets are ported verbatim from styles.css.
 *
 * The product ships a single visual identity — "Aconchego" (cozy indigo +
 * coral, Fredoka). The earlier Sereno/Jardim variants were dropped.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export type ThemeName = 'aconchego';

export type FontWeightName =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold';

export interface Theme {
  name: ThemeName;

  // brand
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  primaryTint: string;
  onPrimary: string;

  // presence / absence semantics
  present: string;
  presentSoft: string;
  presentLine: string;
  presentDeep: string;
  absent: string;
  absentSoft: string;
  absentLine: string;
  absentDeep: string;

  // accent
  gold: string;
  goldSoft: string;
  goldDeep: string;

  // surfaces
  bg: string;
  surface: string;
  surface2: string;

  // ink
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;

  // shape
  radiusCard: number;
  radiusBtn: number;
  radiusField: number;

  // type — maps a logical weight to a loaded Google Font family
  font: Record<FontWeightName, string>;

  // elevation presets (Android-first, with iOS shadow fallbacks)
  shadowCard: ViewStyle;
  shadowPop: ViewStyle;
  shadowFab: ViewStyle;

  // gradients [from, to] for expo-linear-gradient
  gradientSplash: [string, string];
  gradientHero: [string, string];
  gradientLogo: [string, string];
}

const makeShadows = (
  shadowTone: string,
  fabTone: string,
): Pick<Theme, 'shadowCard' | 'shadowPop' | 'shadowFab'> => ({
  shadowCard: {
    shadowColor: shadowTone,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  shadowPop: {
    shadowColor: shadowTone,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 12,
  },
  shadowFab: {
    shadowColor: fabTone,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
});

export const THEMES: Record<ThemeName, Theme> = {
  // ---------- Aconchego (cozy indigo + coral) ----------
  aconchego: {
    name: 'aconchego',
    primary: '#5b6ce0',
    primaryDeep: '#4451c4',
    primarySoft: '#eceefc',
    primaryTint: '#f5f6fd',
    onPrimary: '#ffffff',
    present: '#44ad77',
    presentSoft: '#e8f6ef',
    presentLine: '#bce4cf',
    presentDeep: '#2c7a52',
    absent: '#e9675f',
    absentSoft: '#fceceb',
    absentLine: '#f6c8c4',
    absentDeep: '#bd3328',
    gold: '#efb02a',
    goldSoft: '#fdf3d8',
    goldDeep: '#7d5310',
    bg: '#f4f4fb',
    surface: '#ffffff',
    surface2: '#eeeef7',
    ink: '#2a2d3a',
    inkSoft: '#5a5f72',
    inkFaint: '#9a9eb0',
    line: '#e7e7f1',
    radiusCard: 26,
    radiusBtn: 18,
    radiusField: 16,
    font: {
      // Dialed down two steps from the prototype's heavy 700 so the rounded
      // Fredoka reads softer: "bold" emphasis now renders at Medium (500), the
      // rare "extrabold" peak at SemiBold (600), body stays Regular (400).
      // (Hierarchy is carried by size + color + the indigo accents.)
      regular: 'Fredoka_400Regular',
      medium: 'Fredoka_500Medium',
      semibold: 'Fredoka_500Medium',
      bold: 'Fredoka_500Medium',
      extrabold: 'Fredoka_600SemiBold',
    },
    ...makeShadows('#2a2d3a', '#5b6ce0'),
    gradientSplash: ['#f5f6fd', '#f4f4fb'],
    gradientHero: ['#f5f6fd', '#f4f4fb'],
    gradientLogo: ['#5b6ce0', '#4451c4'],
  },
};

export const DEFAULT_THEME: ThemeName = 'aconchego';

// Every font family that must be loaded at boot.
export const FONT_FAMILIES = [
  'Fredoka_400Regular',
  'Fredoka_500Medium',
  'Fredoka_600SemiBold',
  'Fredoka_700Bold',
] as const;

// Convenience re-exports for typing inline style helpers.
export type { TextStyle, ViewStyle };

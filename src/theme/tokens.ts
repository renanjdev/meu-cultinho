/**
 * Meu Cultinho — design tokens for the 3 visual identities.
 *
 * The web prototype expressed these as CSS custom properties under
 * [data-theme="..."]. React Native has no CSS variables, so each theme is a
 * plain object consumed through useTheme(). Colors, radii, fonts and shadow
 * presets are ported verbatim from styles.css.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export type ThemeName = 'sereno' | 'jardim' | 'aconchego';

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
  absent: string;
  absentSoft: string;
  absentLine: string;

  // accent
  gold: string;
  goldSoft: string;

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
  // ---------- Sereno (soft blue — spec default) ----------
  sereno: {
    name: 'sereno',
    primary: '#3a7bd0',
    primaryDeep: '#2c61aa',
    primarySoft: '#e9f1fb',
    primaryTint: '#f3f8fd',
    onPrimary: '#ffffff',
    present: '#2f9e62',
    presentSoft: '#e7f5ec',
    presentLine: '#b6e0c5',
    absent: '#d9554f',
    absentSoft: '#fbeceb',
    absentLine: '#f1c4c1',
    gold: '#d99a2b',
    goldSoft: '#fbf2dd',
    bg: '#f5f7fb',
    surface: '#ffffff',
    surface2: '#f0f3f8',
    ink: '#2a3340',
    inkSoft: '#5d6878',
    inkFaint: '#9aa3b2',
    line: '#e6eaf0',
    radiusCard: 20,
    radiusBtn: 14,
    radiusField: 14,
    font: {
      regular: 'Nunito_400Regular',
      medium: 'Nunito_600SemiBold',
      semibold: 'Nunito_600SemiBold',
      bold: 'Nunito_700Bold',
      extrabold: 'Nunito_800ExtraBold',
    },
    ...makeShadows('#1c2d46', '#3a7bd0'),
    gradientSplash: ['#f3f8fd', '#f5f7fb'],
    gradientHero: ['#f3f8fd', '#f5f7fb'],
    gradientLogo: ['#3a7bd0', '#2c61aa'],
  },

  // ---------- Jardim (warm teal + gold) ----------
  jardim: {
    name: 'jardim',
    primary: '#2a9387',
    primaryDeep: '#1f7a70',
    primarySoft: '#e2f1ee',
    primaryTint: '#f1f8f6',
    onPrimary: '#ffffff',
    present: '#4ca35f',
    presentSoft: '#e9f4ea',
    presentLine: '#bfe0c3',
    absent: '#d56a5b',
    absentSoft: '#fbeeea',
    absentLine: '#f0cac1',
    gold: '#d3982f',
    goldSoft: '#faf1da',
    bg: '#f7f6f0',
    surface: '#ffffff',
    surface2: '#f1efe6',
    ink: '#2c352f',
    inkSoft: '#5f6a61',
    inkFaint: '#9aa39a',
    line: '#ece9df',
    radiusCard: 22,
    radiusBtn: 16,
    radiusField: 14,
    font: {
      regular: 'Quicksand_400Regular',
      medium: 'Quicksand_500Medium',
      semibold: 'Quicksand_600SemiBold',
      bold: 'Quicksand_700Bold',
      extrabold: 'Quicksand_700Bold',
    },
    ...makeShadows('#28372d', '#2a9387'),
    gradientSplash: ['#f1f8f6', '#f7f6f0'],
    gradientHero: ['#f1f8f6', '#f7f6f0'],
    gradientLogo: ['#2a9387', '#1f7a70'],
  },

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
    absent: '#e9675f',
    absentSoft: '#fceceb',
    absentLine: '#f6c8c4',
    gold: '#efb02a',
    goldSoft: '#fdf3d8',
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
      regular: 'Fredoka_400Regular',
      medium: 'Fredoka_500Medium',
      semibold: 'Fredoka_600SemiBold',
      bold: 'Fredoka_700Bold',
      extrabold: 'Fredoka_700Bold',
    },
    ...makeShadows('#2a2d3a', '#5b6ce0'),
    gradientSplash: ['#f5f6fd', '#f4f4fb'],
    gradientHero: ['#f5f6fd', '#f4f4fb'],
    gradientLogo: ['#5b6ce0', '#4451c4'],
  },
};

export const DEFAULT_THEME: ThemeName = 'sereno';

// Every font family that must be loaded at boot, across all three themes.
export const FONT_FAMILIES = [
  'Nunito_400Regular',
  'Nunito_600SemiBold',
  'Nunito_700Bold',
  'Nunito_800ExtraBold',
  'Quicksand_400Regular',
  'Quicksand_500Medium',
  'Quicksand_600SemiBold',
  'Quicksand_700Bold',
  'Fredoka_400Regular',
  'Fredoka_500Medium',
  'Fredoka_600SemiBold',
  'Fredoka_700Bold',
] as const;

// Convenience re-exports for typing inline style helpers.
export type { TextStyle, ViewStyle };

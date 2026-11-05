export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = { sm: 6, md: 8, lg: 12, pill: 999 } as const;

export const typography = {
  display: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '500',
    letterSpacing: -1.5,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
} as const;

export const layout = { contentMaxWidth: 1080, wideBreakpoint: 768 } as const;
export const controlMinHeight = 48;

const light = {
  background: '#F8F9F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1EC',
  text: '#222C26',
  textMuted: '#5F6C63',
  border: '#DFE5DC',
  controlBorder: '#7E8D81',
  primary: '#3C604D',
  primaryPressed: '#2E4E3D',
  onPrimary: '#FFFFFF',
  danger: '#A73137',
  success: '#276749',
  warning: '#81520C',
} as const;

export type ColorName = keyof typeof light;
export type ThemeColors = Readonly<Record<ColorName, string>>;
export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

const dark: ThemeColors = {
  background: '#131715',
  surface: '#1C221E',
  surfaceMuted: '#272F29',
  text: '#EDF1EB',
  textMuted: '#ADB9AE',
  border: '#343E36',
  controlBorder: '#7D9482',
  primary: '#BCD5C1',
  primaryPressed: '#A5C5AD',
  onPrimary: '#182C20',
  danger: '#FFB4AB',
  success: '#A6D5AD',
  warning: '#F0C781',
};

export const themes: Readonly<Record<ThemeMode, ThemeColors>> = { light, dark };

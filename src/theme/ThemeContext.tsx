import React, { createContext, useContext, ReactNode } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, FONTS, SHADOWS } from './tokens';

export type Theme = {
  colors: {
    bg: string;
    surface: string;
    surfaceElevated: string;
    surfaceSubtle: string;
    surfaceWarm: string;
    border: string;
    borderStrong: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    divider: string;
    shadow: string;
    shadowMed: string;
    overlay: string;
    accent: string;
    accentLight: string;
    accentMid: string;
    accentDark: string;
    accentSoft: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    danger: string;
    dangerLight: string;
    partner: string;
    family: string;
    friend: string;
    child: string;
    parent: string;
    peach: string;
    peachLight: string;
    sage: string;
    sageLight: string;
    lavender: string;
    lavenderLight: string;
    honey: string;
    honeyLight: string;
  };
  spacing: typeof SPACING;
  radius: typeof BORDER_RADIUS;
  typography: typeof TYPOGRAPHY;
  fonts: typeof FONTS;
  shadows: typeof SHADOWS;
};

const theme: Theme = {
  colors: {
    bg: COLORS.bg,
    surface: COLORS.surface,
    surfaceElevated: COLORS.surfaceElevated,
    surfaceSubtle: COLORS.surfaceSubtle,
    surfaceWarm: COLORS.surfaceWarm,
    border: COLORS.border,
    borderStrong: COLORS.borderStrong,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    textTertiary: COLORS.textTertiary,
    textInverse: COLORS.textInverse,
    divider: COLORS.divider,
    shadow: COLORS.shadow,
    shadowMed: COLORS.shadowMed,
    overlay: COLORS.overlay,
    accent: COLORS.accent,
    accentLight: COLORS.accentLight,
    accentMid: COLORS.accentMid,
    accentDark: COLORS.accentDark,
    accentSoft: COLORS.accentSoft,
    success: COLORS.success,
    successLight: COLORS.successLight,
    warning: COLORS.warning,
    warningLight: COLORS.warningLight,
    danger: COLORS.danger,
    dangerLight: COLORS.dangerLight,
    partner: COLORS.partner,
    family: COLORS.family,
    friend: COLORS.friend,
    child: COLORS.child,
    parent: COLORS.parent,
    peach: COLORS.peach,
    peachLight: COLORS.peachLight,
    sage: COLORS.sage,
    sageLight: COLORS.sageLight,
    lavender: COLORS.lavender,
    lavenderLight: COLORS.lavenderLight,
    honey: COLORS.honey,
    honeyLight: COLORS.honeyLight,
  },
  spacing: SPACING,
  radius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  fonts: FONTS,
  shadows: SHADOWS,
};

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

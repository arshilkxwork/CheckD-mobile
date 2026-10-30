import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState, useCallback } from 'react';
import { TextStyle, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark, Palette } from './palette';

export type AppearanceMode = 'system' | 'light' | 'dark';

const MODE_KEY = 'pingkin/appearance';

const SERIF = 'InstrumentSerif_400Regular';
const SERIF_ITALIC = 'InstrumentSerif_400Regular_Italic';

// Titles and names in the serif; everything else in the platform's own face.
const type = {
  display: { fontFamily: SERIF, fontSize: 44, lineHeight: 48, letterSpacing: -0.6 },
  largeTitle: { fontFamily: SERIF, fontSize: 36, lineHeight: 42, letterSpacing: -0.4 },
  title: { fontFamily: SERIF, fontSize: 28, lineHeight: 34, letterSpacing: -0.2 },
  title2: { fontFamily: SERIF, fontSize: 22, lineHeight: 28 },
  serifItalic: { fontFamily: SERIF_ITALIC },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23 },
  callout: { fontSize: 15, lineHeight: 21 },
  subhead: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.2 },
} satisfies Record<string, TextStyle>;

const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 44 };
const radius = { sm: 12, md: 16, lg: 22, xl: 28, xxl: 32, xxxl: 36, full: 999 };

function buildTheme(c: Palette) {
  const shadow = (y: number, blur: number, k = 1) => ({
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: c.shadowOpacity * k,
    shadowRadius: blur,
    // Android draws elevation through translucent fills; glass stays flat there.
    elevation: 0,
  });
  return {
    c,
    isDark: c.isDark,
    type,
    space,
    radius,
    shadow: {
      soft: shadow(6, 18),
      lifted: shadow(14, 32, 1.3),
      accent: { ...shadow(8, 18, 1.6), shadowColor: c.isDark ? '#000000' : c.accent },
    },
  };
}

export type Theme = ReturnType<typeof buildTheme>;

interface ThemeContextValue {
  theme: Theme;
  mode: AppearanceMode;
  setMode: (m: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme(light),
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: AppearanceMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const theme = useMemo(() => buildTheme(isDark ? dark : light), [isDark]);

  return <ThemeContext.Provider value={{ theme, mode, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Mist & Forest palette ───────────────────────────────────────────────────
// Light is a misty sage morning; dark is a forest at night. Both sit on a
// pre-blurred botanical backdrop, so "glass" here is a translucent fill with a
// bright hairline edge rather than a live blur.

import { ImageSourcePropType } from 'react-native';
import { NudgeCategory, RelationshipType } from '../types';

export type Tint = { fg: string; bg: string };

export type Palette = {
  isDark: boolean;
  backdrop: ImageSourcePropType;
  bg: string;
  glass: string;
  glassStrong: string;
  glassEdge: string;
  hairline: string;
  barGlass: string;
  scrim: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  accentText: string;
  warm: string;
  warmSoft: string;
  danger: string;
  dangerSoft: string;
  shadow: string;
  shadowOpacity: number;
  blurTint: 'light' | 'dark';
  category: Record<NudgeCategory, Tint>;
  relationship: Record<RelationshipType, Tint>;
};

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const tint = (fg: string, alpha: number): Tint => ({ fg, bg: withAlpha(fg, alpha) });

export const light: Palette = {
  isDark: false,
  backdrop: require('../../assets/backdrop-light.jpg'),
  bg: '#E9EFE8',
  glass: 'rgba(255, 255, 255, 0.52)',
  glassStrong: 'rgba(255, 255, 255, 0.74)',
  glassEdge: 'rgba(255, 255, 255, 0.9)',
  hairline: 'rgba(24, 36, 28, 0.08)',
  barGlass: 'rgba(246, 249, 245, 0.78)',
  scrim: 'rgba(20, 32, 24, 0.28)',
  text: '#18241C',
  textSecondary: '#4B5C50',
  textTertiary: '#64766A',
  accent: '#4C7D59',
  onAccent: '#FFFFFF',
  accentSoft: 'rgba(76, 125, 89, 0.13)',
  accentText: '#3B6847',
  warm: '#9C6427',
  warmSoft: 'rgba(214, 150, 80, 0.17)',
  danger: '#9E4F3F',
  dangerSoft: 'rgba(168, 90, 74, 0.13)',
  shadow: '#24382A',
  shadowOpacity: 0.09,
  blurTint: 'light',
  category: {
    medicine: tint('#6D5FA0', 0.14),
    water: tint('#3F7398', 0.14),
    exercise: tint('#4F7F42', 0.15),
    homework: tint('#8A6627', 0.15),
    checkin: tint('#9E5946', 0.14),
    custom: tint('#55665B', 0.13),
  },
  relationship: {
    partner: tint('#9E5946', 0.16),
    family: tint('#4F7F42', 0.16),
    friend: tint('#3F7398', 0.16),
    child: tint('#8A6627', 0.17),
    parent: tint('#6D5FA0', 0.16),
  },
};

export const dark: Palette = {
  isDark: true,
  backdrop: require('../../assets/backdrop-dark.jpg'),
  bg: '#0D1813',
  glass: 'rgba(255, 255, 255, 0.055)',
  glassStrong: 'rgba(255, 255, 255, 0.095)',
  glassEdge: 'rgba(255, 255, 255, 0.11)',
  hairline: 'rgba(255, 255, 255, 0.08)',
  barGlass: 'rgba(20, 34, 26, 0.82)',
  scrim: 'rgba(0, 0, 0, 0.5)',
  text: '#E6EEE7',
  textSecondary: '#A8BAAD',
  textTertiary: '#86998B',
  accent: '#B6D3A3',
  onAccent: '#10201A',
  accentSoft: 'rgba(182, 211, 163, 0.14)',
  accentText: '#BCD8A9',
  warm: '#E6BA80',
  warmSoft: 'rgba(230, 186, 128, 0.14)',
  danger: '#E5A291',
  dangerSoft: 'rgba(229, 162, 145, 0.14)',
  shadow: '#000000',
  shadowOpacity: 0.32,
  blurTint: 'dark',
  category: {
    medicine: tint('#C4B8EC', 0.15),
    water: tint('#9FC8E2', 0.15),
    exercise: tint('#B3D6A2', 0.15),
    homework: tint('#E6C68C', 0.15),
    checkin: tint('#EDAE9B', 0.15),
    custom: tint('#B9C6BE', 0.13),
  },
  relationship: {
    partner: tint('#EDAE9B', 0.17),
    family: tint('#B3D6A2', 0.17),
    friend: tint('#9FC8E2', 0.17),
    child: tint('#E6C68C', 0.17),
    parent: tint('#C4B8EC', 0.17),
  },
};

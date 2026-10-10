// ─── Design Tokens — Comfort & Warmth ─────────────────────────────────────
//  Headspace × Finch × Notion: soft, reassuring, emotionally safe, deeply reliable.
//  Palette: milky cream backgrounds, muted earth-comfort tones, warm charcoal text.

export const COLORS = {
  // Brand — gentle matcha-sage (calm, trust, emotional safety)
  accent: '#6B9E7E',           // Muted matcha sage
  accentLight: '#EDF5F0',      // Whisper-sage tint
  accentMid: '#8AB89A',        // Soft moss
  accentDark: '#4A7A5E',       // Deep sage
  accentSoft: '#F4F9F6',       // Barely-there sage

  // Secondary comfort tones
  peach: '#D4956B',            // Warm terracotta (comfort, grounding)
  peachLight: '#FDF3EC',
  sage: '#7BAE8E',             // Muted green (growth, renewal)
  sageLight: '#EFF6F1',
  lavender: '#9B8EC4',         // Soft lavender (serenity, rest)
  lavenderLight: '#F2EFF8',
  honey: '#D4A85C',            // Buttery gold (warmth, delight)
  honeyLight: '#FDF6EC',

  // Semantic — gentle, not alarming
  success: '#6B9E7E',          // Same as accent (natural, affirming)
  successLight: '#EDF5F0',
  warning: '#D4A85C',          // Warm honey (gentle attention)
  warningLight: '#FDF6EC',
  danger: '#C2796B',           // Muted terracotta-rose (soft, not harsh)
  dangerLight: '#FBF0ED',

  // Relationship colors — warm, muted, emotionally toned
  partner: '#C2796B',          // Terracotta-rose     ❤️  warmth & love
  family: '#7BAE8E',           // Soft sage           🏡  safety & roots
  friend: '#7A9CC6',           // Muted cornflower    🫂  trust & ease
  child: '#D4A85C',            // Buttery gold        ⭐  wonder & joy
  parent: '#9B8EC4',           // Soft lavender       🌿  wisdom & peace

  // Surfaces — oatmeal, cream, milky warmth
  bg: '#FAF8F5',               // Warm oatmeal cream
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F5F3EF',    // Soft linen
  surfaceWarm: '#F8F2EA',      // Biscuit warmth
  border: '#EDE8E1',           // Sandy beige border (no harsh lines)
  borderStrong: '#DDD5CA',
  text: '#2D3139',             // Warm charcoal — readable, never harsh
  textSecondary: '#5C6370',    // Soft slate
  textTertiary: '#9CA3AB',     // Muted fog
  textInverse: '#FFFFFF',
  divider: '#F0ECE6',          // Barely-there sand line
  shadow: 'rgba(45, 49, 57, 0.04)',
  shadowMed: 'rgba(45, 49, 57, 0.07)',
  overlay: 'rgba(45, 49, 57, 0.30)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
  massive: 72,
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 36,
  full: 999,
};

export const TYPOGRAPHY = {
  // Font sizes — slightly relaxed
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 36,
  massive: 48,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Line heights — relaxed for stress-free reading
  lineHeightRelaxed: 1.65,
  lineHeightBody: 1.55,
  lineHeightHeading: 1.25,
};

export const FONTS = {
  // Headings: Nunito — soft, rounded, humanist
  heading: 'Nunito_600SemiBold',
  headingBold: 'Nunito_700Bold',
  // Body: Plus Jakarta Sans — warm, legible, modern
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemibold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#2D3139',      // Warm charcoal — ultra-diffused
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D3139',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2D3139',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 5,
  },
  accent: {
    shadowColor: '#6B9E7E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const ANIMATION = {
  fast: 180,
  normal: 300,
  slow: 450,
  spring: { damping: 22, stiffness: 220 },
};

export const RELATIONSHIP_CONFIG = {
  partner: { emoji: '❤️', label: 'Partner', color: COLORS.partner },
  family: { emoji: '🏡', label: 'Family', color: COLORS.family },
  friend: { emoji: '🫂', label: 'Friend', color: COLORS.friend },
  child: { emoji: '⭐️', label: 'Child', color: COLORS.child },
  parent: { emoji: '🌿', label: 'Parent', color: COLORS.parent },
};

export const CATEGORY_CONFIG = {
  medicine: { emoji: '💊', label: 'Medicine', color: COLORS.lavender },
  water:    { emoji: '💧', label: 'Hydration', color: COLORS.sage },
  exercise: { emoji: '🌿', label: 'Exercise', color: COLORS.peach },
  homework: { emoji: '📖', label: 'Homework', color: COLORS.lavender },
  checkin:  { emoji: '💌', label: 'Check In', color: COLORS.partner },
  custom:   { emoji: '✨', label: 'Custom', color: COLORS.textTertiary },
};

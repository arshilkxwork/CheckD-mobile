// ─── Labels and icons ────────────────────────────────────────────────────────
// Colours live in palette.ts (per appearance); this file maps data enums to the
// words and line icons the UI shows for them.

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { NudgeCategory, RelationshipType } from '../types';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const RELATIONSHIP_CONFIG: Record<RelationshipType, { label: string; icon: IconName; emoji: string }> = {
  partner: { label: 'Partner', icon: 'heart-outline', emoji: '❤️' },
  family: { label: 'Family', icon: 'home-outline', emoji: '🏡' },
  friend: { label: 'Friend', icon: 'people-outline', emoji: '🫂' },
  child: { label: 'Child', icon: 'happy-outline', emoji: '⭐️' },
  parent: { label: 'Parent', icon: 'leaf-outline', emoji: '🌿' },
};

export const CATEGORY_CONFIG: Record<NudgeCategory, { label: string; icon: IconName; emoji: string }> = {
  medicine: { label: 'Medicine', icon: 'medkit-outline', emoji: '💊' },
  water: { label: 'Water', icon: 'water-outline', emoji: '💧' },
  exercise: { label: 'Movement', icon: 'walk-outline', emoji: '🌿' },
  homework: { label: 'Homework', icon: 'book-outline', emoji: '📖' },
  checkin: { label: 'Check in', icon: 'chatbubble-ellipses-outline', emoji: '💌' },
  custom: { label: 'Custom', icon: 'sparkles-outline', emoji: '✨' },
};

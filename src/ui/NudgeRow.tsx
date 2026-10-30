import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { Nudge, User } from '../types';
import { formatTime } from '../utils/formatters';

import { Glass, IconWell, Tap, Txt } from './primitives';
import { CheckButton, Tag } from './pieces';

const REPEAT_SHORT: Record<string, string> = { daily: 'Daily', weekdays: 'Weekdays', weekends: 'Weekends', weekly: 'Weekly', custom: 'Repeats' };

/**
 * One nudge as a glass row: category, title, who and when, and the Done check.
 * `who` is the other person (recipient for nudges you sent, sender for yours).
 */
export function NudgeRow({
  nudge,
  who,
  direction,
  onPress,
  onDone,
}: {
  nudge: Nudge;
  who?: User | null;
  direction: 'for-me' | 'sent' | 'self';
  onPress?: () => void;
  onDone?: () => void;
}) {
  const { theme } = useTheme();
  const { c } = theme;
  const cat = CATEGORY_CONFIG[nudge.category] ?? CATEGORY_CONFIG.custom;
  const tint = c.category[nudge.category] ?? c.category.custom;
  const done = nudge.status === 'completed';
  const open = nudge.status === 'pending' || nudge.status === 'snoozed';

  const whoLine =
    direction === 'self' || !who
      ? 'For you'
      : direction === 'sent'
        ? `For ${who.firstName}`
        : `From ${who.firstName}`;
  const when = done && nudge.completedAt ? `Done ${formatTime(nudge.completedAt)}` : formatTime(nudge.dueAt ?? nudge.scheduledTime);
  const meta = [whoLine, when, REPEAT_SHORT[nudge.repeat] ?? null].filter(Boolean).join(' · ');

  return (
    <Tap
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`${nudge.title}, ${meta}`}
    >
      <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}>
        <IconWell name={cat.icon} size={44} fg={tint.fg} bg={tint.bg} />
        <View style={{ flex: 1, gap: 3 }}>
          <Txt v="headline" numberOfLines={1} tone={done ? 'secondary' : 'primary'}>
            {nudge.title}
          </Txt>
          <Txt v="footnote" tone="secondary" numberOfLines={1}>
            {meta}
          </Txt>
          {nudge.status === 'snoozed' && nudge.snoozedUntil ? (
            <View style={{ marginTop: 4 }}>
              <Tag tone="warm" icon="alarm-outline" label={`Snoozed until ${formatTime(nudge.snoozedUntil)}`} />
            </View>
          ) : null}
          {nudge.status === 'missed' ? (
            <View style={{ marginTop: 4 }}>
              <Tag tone="danger" label="Missed" />
            </View>
          ) : null}
        </View>
        {onDone && (open || done) ? <CheckButton done={done} onDone={onDone} label={`Mark ${nudge.title} done`} /> : null}
      </Glass>
    </Tap>
  );
}

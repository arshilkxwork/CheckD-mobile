import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Nudge, User } from '../types';
import { RELATIONSHIP_CONFIG } from '../theme/tokens';
import { formatTime } from '../utils/formatters';

interface NudgeCardProps {
  nudge: Nudge;
  person: User;
  onPress?: () => void;
  onComplete?: () => void;
  onSnooze?: () => void;
  showPerson?: boolean;
}

export function NudgeCard({
  nudge,
  person,
  onPress,
  onComplete,
  onSnooze,
  showPerson = true,
}: NudgeCardProps) {
  const { theme } = useTheme();
  const { colors, radius, typography, fonts, shadows } = theme;

  const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;
  const isPending = nudge.status === 'pending' || nudge.status === 'snoozed';
  const isCompleted = nudge.status === 'completed';
  const isMissed = nudge.status === 'missed';
  const isSnoozed = nudge.status === 'snoozed';

  // Category background tints — earthy, warm pastels
  const catBgMap: Record<string, string> = {
    medicine:  colors.lavenderLight,
    water:     colors.sageLight,
    exercise:  colors.peachLight,
    homework:  colors.lavenderLight,
    checkin:   colors.peachLight,
    custom:    colors.surfaceSubtle,
  };

  const cardBg = isCompleted
    ? colors.surfaceSubtle
    : catBgMap[nudge.category] ?? colors.surface;

  const statusColor = isCompleted
    ? colors.success
    : isMissed
    ? colors.danger
    : isSnoozed
    ? colors.warning
    : colors.accent;

  const statusBg = isCompleted
    ? colors.successLight
    : isMissed
    ? colors.dangerLight
    : isSnoozed
    ? colors.warningLight
    : colors.accentLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderRadius: radius.xxl,
          ...shadows.sm,
          opacity: isCompleted ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        {/* Emoji bubble */}
        <View
          style={[
            styles.emojiBubble,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Text style={styles.emoji}>{nudge.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {showPerson && (
            <View style={styles.personRow}>
              <View
                style={[
                  styles.personDot,
                  { backgroundColor: person.avatarColor },
                ]}
              />
              <Text
                style={[
                  styles.personName,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: fonts.bodySemibold,
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {person.firstName.toUpperCase()}
              </Text>
              {rel && (
                <Text style={[{ color: colors.textTertiary, fontSize: typography.xs }]}>
                  {' '}{rel.emoji}
                </Text>
              )}
            </View>
          )}
          <Text
            style={[
              styles.nudgeTitle,
              {
                color: isCompleted ? colors.textSecondary : colors.text,
                fontSize: typography.md,
                fontFamily: fonts.bodySemibold,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
                marginTop: showPerson ? 4 : 0,
              },
            ]}
          >
            {nudge.title}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusBg, borderRadius: radius.full },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: statusColor,
                    fontSize: typography.xs,
                    fontFamily: fonts.bodySemibold,
                  },
                ]}
              >
                {isCompleted
                  ? `✓ Done · ${nudge.completedAt ? formatTime(nudge.completedAt) : ''}`
                  : isMissed
                  ? '— Missed'
                  : isSnoozed
                  ? '⏱ Snoozed'
                  : `${formatTime(nudge.scheduledTime)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons — only for pending */}
      {isPending && (onComplete || onSnooze) && (
        <View style={[styles.actions, { borderTopColor: colors.divider }]}>
          {onSnooze && (
            <TouchableOpacity
              onPress={onSnooze}
              style={[
                styles.snoozeBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodyMedium }]}>
                Later ⏰
              </Text>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity
              onPress={onComplete}
              activeOpacity={0.8}
              style={[
                styles.completeBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.full,
                  ...shadows.accent,
                  flex: 1,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: '#fff',
                    fontSize: typography.sm,
                    fontFamily: fonts.bodySemibold,
                  },
                ]}
              >
                ✓ Done
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  emojiBubble: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 24 },
  content: { flex: 1 },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 1,
  },
  personDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  personName: {},
  nudgeTitle: {},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: {},
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  snoozeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  completeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

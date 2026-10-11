import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { StreakInfo } from '../types';

interface StreakCardProps {
  streak: StreakInfo;
  personName?: string;
  onPressDetails?: () => void;
}

export function StreakCard({ streak, personName, onPressDetails }: StreakCardProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows, spacing } = theme;

  const isFlames = streak.currentStreak >= 3;
  const streakEmoji = streak.currentStreak >= 7 ? '👑' : isFlames ? '🔥' : '🌱';

  const headline = personName
    ? `${streak.currentStreak}-day care streak with ${personName}`
    : `${streak.currentStreak}-day care streak`;

  const encouragement =
    streak.currentStreak >= 7
      ? 'Remarkable care continuity! Keep this momentum glowing.'
      : streak.currentStreak >= 3
      ? 'A wonderful daily rhythm is forming!'
      : 'Every single nudge completed builds trust and care.';

  return (
    <TouchableOpacity
      activeOpacity={onPressDetails ? 0.88 : 1}
      onPress={onPressDetails}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View
            style={[
              styles.flameIconWrap,
              {
                backgroundColor: isFlames ? '#FDF3EC' : colors.accentLight,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={{ fontSize: 28 }}>{streakEmoji}</Text>
          </View>
          <View>
            <View style={styles.streakCountRow}>
              <Text
                style={[
                  styles.streakNumber,
                  {
                    color: isFlames ? '#D4956B' : colors.accent,
                    fontSize: typography.xxxl,
                    fontFamily: fonts.headingBold,
                  },
                ]}
              >
                {streak.currentStreak}
              </Text>
              <Text
                style={[
                  styles.streakDaysLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.md,
                    fontFamily: fonts.bodySemibold,
                  },
                ]}
              >
                {streak.currentStreak === 1 ? 'day' : 'days in a row'}
              </Text>
            </View>
            <Text
              style={[
                styles.headline,
                {
                  color: colors.text,
                  fontSize: typography.sm,
                  fontFamily: fonts.bodySemibold,
                },
              ]}
            >
              {headline}
            </Text>
          </View>
        </View>

        {onPressDetails && (
          <View
            style={[
              styles.detailsPill,
              {
                backgroundColor: colors.surfaceWarm,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                {
                  color: colors.accent,
                  fontSize: typography.xs,
                  fontFamily: fonts.bodySemibold,
                },
              ]}
            >
              Insights →
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.encouragement,
          {
            color: colors.textSecondary,
            fontSize: typography.xs,
            fontFamily: fonts.body,
            lineHeight: typography.xs * typography.lineHeightBody,
            marginTop: spacing.sm,
          },
        ]}
      >
        {encouragement}
      </Text>

      {/* Mini metrics bar */}
      <View
        style={[
          styles.metricsBar,
          {
            backgroundColor: colors.surfaceSubtle,
            borderRadius: radius.xl,
            marginTop: spacing.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.text, fontSize: typography.sm, fontFamily: fonts.bodyBold },
            ]}
          >
            {streak.longestStreak} days
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body },
            ]}
          >
            Best streak
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.accent, fontSize: typography.sm, fontFamily: fonts.bodyBold },
            ]}
          >
            {streak.completionRate}%
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body },
            ]}
          >
            Care reliability
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.text, fontSize: typography.sm, fontFamily: fonts.bodyBold },
            ]}
          >
            {streak.totalCompleted}
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body },
            ]}
          >
            Completed nudges
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  flameIconWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakNumber: {
    lineHeight: 34,
  },
  streakDaysLabel: {
    marginBottom: 2,
  },
  headline: {
    marginTop: 2,
  },
  detailsPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  encouragement: {},
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {},
  metricLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
});

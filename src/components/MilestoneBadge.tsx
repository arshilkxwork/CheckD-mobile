import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CareMilestone } from '../types';

interface MilestoneBadgeProps {
  milestone: CareMilestone;
}

export function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, spacing, shadows } = theme;

  const isUnlocked = milestone.unlocked;
  const progressRatio = milestone.target > 0 ? Math.min(milestone.current / milestone.target, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isUnlocked ? colors.surface : colors.surfaceSubtle,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: isUnlocked ? colors.borderStrong : colors.border,
          padding: spacing.md,
          ...shadows.sm,
          opacity: isUnlocked ? 1 : 0.85,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isUnlocked ? colors.honeyLight : colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text style={{ fontSize: 24 }}>{milestone.icon}</Text>
        </View>

        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: typography.sm,
                  fontFamily: fonts.bodySemibold,
                },
              ]}
            >
              {milestone.title}
            </Text>
            {isUnlocked && (
              <View
                style={[
                  styles.unlockedTag,
                  {
                    backgroundColor: colors.successLight,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    {
                      color: colors.success,
                      fontSize: 10,
                      fontFamily: fonts.bodyBold,
                    },
                  ]}
                >
                  UNLOCKED ✓
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontSize: typography.xs,
                fontFamily: fonts.body,
                marginTop: 2,
              },
            ]}
          >
            {milestone.description}
          </Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={{ marginTop: spacing.sm }}>
        <View style={styles.progressLabelRow}>
          <Text style={[{ color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body }]}>
            {isUnlocked ? 'Completed' : 'Progress'}
          </Text>
          <Text
            style={[
              {
                color: isUnlocked ? colors.success : colors.textSecondary,
                fontSize: 10,
                fontFamily: fonts.bodySemibold,
              },
            ]}
          >
            {milestone.current} / {milestone.target} ({progressPercent}%)
          </Text>
        </View>
        <View
          style={[
            styles.trackBg,
            {
              backgroundColor: colors.border,
              borderRadius: radius.full,
            },
          ]}
        >
          <View
            style={[
              styles.trackFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isUnlocked ? colors.accent : colors.honey,
                borderRadius: radius.full,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {},
  unlockedTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  description: {},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackBg: {
    height: 6,
    overflow: 'hidden',
  },
  trackFill: {
    height: 6,
  },
});

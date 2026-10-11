import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { WeeklyActivityDay } from '../types';

interface WeeklyActivityChartProps {
  days: WeeklyActivityDay[];
  title?: string;
}

export function WeeklyActivityChart({ days, title = 'THIS WEEK AT A GLANCE' }: WeeklyActivityChartProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, spacing, shadows } = theme;

  const completedDays = days.filter((d) => !d.isFuture && d.percentage === 100).length;
  const activePastDays = days.filter((d) => !d.isFuture).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xxl,
          padding: spacing.lg,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textSecondary,
              fontSize: typography.xs,
              fontFamily: fonts.bodySemibold,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            {
              color: colors.accent,
              fontSize: typography.xs,
              fontFamily: fonts.bodySemibold,
            },
          ]}
        >
          {completedDays}/{activePastDays} days complete
        </Text>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => {
          const isDone = !day.isFuture && day.percentage === 100;
          const isPartial = !day.isFuture && day.percentage > 0 && day.percentage < 100;
          const isMissed = !day.isFuture && day.total > 0 && day.completed === 0;

          return (
            <View key={day.date} style={styles.dayCol}>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: day.isToday ? colors.accent : colors.textTertiary,
                    fontSize: typography.xs,
                    fontFamily: day.isToday ? fonts.bodyBold : fonts.body,
                  },
                ]}
              >
                {day.day}
              </Text>

              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: day.isFuture
                      ? colors.border
                      : isDone
                      ? colors.successLight
                      : isPartial
                      ? colors.warningLight
                      : isMissed
                      ? colors.dangerLight
                      : colors.successLight,
                    borderColor: day.isToday ? colors.accent : 'transparent',
                    borderWidth: day.isToday ? 2 : 0,
                    borderRadius: radius.full,
                  },
                ]}
              >
                {day.isFuture ? (
                  <View style={[styles.futureDot, { backgroundColor: colors.textTertiary }]} />
                ) : isDone ? (
                  <Text style={{ fontSize: 13, color: colors.success }}>✓</Text>
                ) : isPartial ? (
                  <Text style={{ fontSize: 10, color: colors.warning, fontWeight: '700' }}>
                    {day.completed}/{day.total}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: colors.danger }}>—</Text>
                )}
              </View>

              <Text
                style={[
                  styles.dateNum,
                  {
                    color: day.isToday ? colors.text : colors.textTertiary,
                    fontSize: 10,
                    fontFamily: fonts.body,
                  },
                ]}
              >
                {new Date(day.date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Mini legend */}
      <View style={[styles.legendRow, { borderTopColor: colors.divider, paddingTop: spacing.sm }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[{ color: colors.textSecondary, fontSize: 10, fontFamily: fonts.body }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={[{ color: colors.textSecondary, fontSize: 10, fontFamily: fonts.body }]}>
            In progress
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
          <Text style={[{ color: colors.textSecondary, fontSize: 10, fontFamily: fonts.body }]}>
            Upcoming
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    letterSpacing: 0.2,
  },
  dayCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  dateNum: {},
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

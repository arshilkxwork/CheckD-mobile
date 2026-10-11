import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { StreakCard } from '../components/StreakCard';
import { WeeklyActivityChart } from '../components/WeeklyActivityChart';
import { MilestoneBadge } from '../components/MilestoneBadge';
import { CheerModal } from '../components/CheerModal';
import {
  calculateStreak,
  getWeeklyActivity,
  calculateCategoryDistribution,
  evaluateMilestones,
} from '../utils/insights';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { NudgeCategory } from '../types';

export function InsightsScreen({ navigation, route }: any) {
  const initialPersonId = route?.params?.personId;
  const { people, nudges, history, cheers, sendCheer } = useApp();
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, spacing, shadows } = theme;

  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>(initialPersonId);
  const [cheerModalVisible, setCheerModalVisible] = useState(false);

  const selectedPerson = useMemo(
    () => (selectedPersonId ? people.find((p) => p.id === selectedPersonId) : undefined),
    [selectedPersonId, people]
  );

  // Compute metrics
  const streak = useMemo(
    () => calculateStreak(history, nudges, selectedPersonId),
    [history, nudges, selectedPersonId]
  );

  const weeklyDays = useMemo(
    () => getWeeklyActivity(history, nudges, selectedPersonId),
    [history, nudges, selectedPersonId]
  );

  const categories = useMemo(
    () => calculateCategoryDistribution(history, nudges, selectedPersonId),
    [history, nudges, selectedPersonId]
  );

  const milestones = useMemo(
    () => evaluateMilestones(history, nudges, cheers),
    [history, nudges, cheers]
  );

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* ── Top Header ── */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderRadius: radius.full, ...shadows.sm }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyBold }]}>
              ←
            </Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold },
              ]}
            >
              Care Insights
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body },
              ]}
            >
              Streaks, consistency & care habits
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setCheerModalVisible(true)}
            activeOpacity={0.8}
            style={[
              styles.cheerTopBtn,
              { backgroundColor: colors.honeyLight, borderRadius: radius.full },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 4 }}>🎉</Text>
            <Text
              style={[
                { color: colors.honey, fontSize: typography.xs, fontFamily: fonts.bodyBold },
              ]}
            >
              Cheer
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Person Selector Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.personScroll}
          contentContainerStyle={{ paddingRight: spacing.lg }}
        >
          <TouchableOpacity
            onPress={() => setSelectedPersonId(undefined)}
            style={[
              styles.personChip,
              {
                backgroundColor: !selectedPersonId ? colors.accent : colors.surface,
                borderColor: !selectedPersonId ? colors.accent : colors.border,
                borderRadius: radius.full,
                ...shadows.sm,
              },
            ]}
          >
            <Text
              style={[
                {
                  color: !selectedPersonId ? '#fff' : colors.text,
                  fontSize: typography.xs,
                  fontFamily: !selectedPersonId ? fonts.bodyBold : fonts.bodyMedium,
                },
              ]}
            >
              All Care Circle 💛
            </Text>
          </TouchableOpacity>

          {people.map((p) => {
            const isSelected = selectedPersonId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPersonId(p.id)}
                style={[
                  styles.personChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderRadius: radius.full,
                    ...shadows.sm,
                  },
                ]}
              >
                <View
                  style={[
                    styles.chipDot,
                    {
                      backgroundColor: isSelected ? '#fff' : p.avatarColor,
                      borderRadius: radius.full,
                    },
                  ]}
                />
                <Text
                  style={[
                    {
                      color: isSelected ? '#fff' : colors.text,
                      fontSize: typography.xs,
                      fontFamily: isSelected ? fonts.bodyBold : fonts.bodyMedium,
                    },
                  ]}
                >
                  {p.firstName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Main Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }}
      >
        {/* Streak Hero Card */}
        <View style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
          <StreakCard streak={streak} personName={selectedPerson?.firstName} />
        </View>

        {/* Weekly Adherence Chart */}
        <View style={{ marginBottom: spacing.lg }}>
          <WeeklyActivityChart
            days={weeklyDays}
            title={selectedPerson ? `${selectedPerson.firstName.toUpperCase()}'S WEEKLY ADHERENCE` : undefined}
          />
        </View>

        {/* Category Breakdown */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xxl,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              ...shadows.sm,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
              ]}
            >
              CARE CATEGORY DISTRIBUTION
            </Text>
            <Text
              style={[
                { color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
              ]}
            >
              {categories.reduce((acc, c) => acc + c.count, 0)} total
            </Text>
          </View>

          <View style={{ marginTop: spacing.md, gap: 12 }}>
            {categories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat.category as NudgeCategory] || CATEGORY_CONFIG.custom;
              return (
                <View key={cat.category}>
                  <View style={styles.catRow}>
                    <View style={styles.catLeft}>
                      <Text style={{ fontSize: 16, marginRight: 6 }}>{cfg.emoji}</Text>
                      <Text
                        style={[
                          { color: colors.text, fontSize: typography.sm, fontFamily: fonts.bodyMedium },
                        ]}
                      >
                        {cfg.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
                      ]}
                    >
                      {cat.count} ({cat.percentage}%)
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.barTrack,
                      { backgroundColor: colors.surfaceSubtle, borderRadius: radius.full },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(cat.percentage, 4)}%`,
                          backgroundColor: cfg.color,
                          borderRadius: radius.full,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Response Speed & Time-of-Day Insights */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceWarm,
              borderRadius: radius.xxl,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold, marginBottom: 8 },
            ]}
          >
            CARE SPEED & RELIABILITY ⏱️
          </Text>
          <View style={styles.speedRow}>
            <View style={styles.speedCol}>
              <Text
                style={[
                  styles.speedValue,
                  { color: colors.accent, fontSize: typography.xxl, fontFamily: fonts.headingBold },
                ]}
              >
                14m
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body }]}>
                Avg. response time
              </Text>
            </View>

            <View style={[styles.speedDivider, { backgroundColor: colors.border }]} />

            <View style={styles.speedCol}>
              <Text
                style={[
                  styles.speedValue,
                  { color: colors.peach, fontSize: typography.xxl, fontFamily: fonts.headingBold },
                ]}
              >
                94%
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body }]}>
                On-time rate
              </Text>
            </View>
          </View>
        </View>

        {/* Milestone Badges */}
        <View style={{ marginBottom: spacing.xl }}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
              ]}
            >
              CARE MILESTONES & BADGES 🏆
            </Text>
            <Text
              style={[
                { color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
              ]}
            >
              {unlockedCount}/{milestones.length} unlocked
            </Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            {milestones.map((m) => (
              <MilestoneBadge key={m.id} milestone={m} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Cheer Modal */}
      <CheerModal
        visible={cheerModalVisible}
        onClose={() => setCheerModalVisible(false)}
        people={people}
        defaultPersonId={selectedPersonId}
        onSendCheer={sendCheer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 2,
  },
  cheerTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  personScroll: {
    paddingVertical: 4,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  chipDot: {
    width: 8,
    height: 8,
    marginRight: 6,
  },
  sectionCard: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    letterSpacing: 0.6,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barTrack: {
    height: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  speedCol: {
    alignItems: 'center',
  },
  speedValue: {
    lineHeight: 32,
    marginBottom: 2,
  },
  speedDivider: {
    width: 1,
    height: 36,
  },
});

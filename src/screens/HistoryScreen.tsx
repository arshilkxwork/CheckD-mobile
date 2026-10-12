import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatTime } from '../utils/formatters';
import { HistoryEntry } from '../types';

export function HistoryScreen({ navigation }: any) {
  const { history, people, currentUser } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  // Group by date
  const grouped = groupByDate(history);
  const sections = Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      data: grouped[date].sort(
        (a, b) =>
          (b.completedAt ? new Date(b.completedAt).getTime() : 0) -
          (a.completedAt ? new Date(a.completedAt).getTime() : 0)
      ),
    }));

  const getPerson = (id: string) =>
    people.find((p) => p.id === id) || currentUser;

  if (history.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
            History
          </Text>
        </View>
        <EmptyState
          emoji="📖"
          title="Your story starts here."
          subtitle="Complete your first nudge to see it here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 56 }}
        ListHeaderComponent={
          <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
                  History
                </Text>
                <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
                  A record of care ❤️
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Medications')}
                  activeOpacity={0.8}
                  style={[
                    styles.insightsBtn,
                    { backgroundColor: colors.surfaceWarm, borderRadius: radius.full, ...shadows.sm },
                  ]}
                  accessibilityLabel="View Care Cabinet"
                >
                  <Text style={{ fontSize: 16, marginRight: 6 }}>💊</Text>
                  <Text style={[{ color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                    Cabinet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Insights')}
                  activeOpacity={0.8}
                  style={[
                    styles.insightsBtn,
                    { backgroundColor: colors.surfaceWarm, borderRadius: radius.full, ...shadows.sm },
                  ]}
                  accessibilityLabel="View Insights"
                >
                  <Text style={{ fontSize: 16, marginRight: 6 }}>📊</Text>
                  <Text style={[{ color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                    Insights
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation?.navigate('Insights')}
              activeOpacity={0.85}
              style={[
                styles.insightsCallout,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginTop: spacing.md,
                  padding: spacing.md,
                  ...shadows.sm,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.text, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                    Care Continuity & Streaks
                  </Text>
                  <Text style={[{ color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body, marginTop: 1 }]}>
                    Review adherence rates, category breakdown & badges
                  </Text>
                </View>
                <Text style={[{ color: colors.accent, fontSize: typography.sm, fontFamily: fonts.bodyBold }]}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, backgroundColor: colors.bg }]}>
            <Text
              style={[
                styles.sectionHeaderText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                  fontFamily: fonts.bodySemibold,
                },
              ]}
            >
              {formatDate(section.date).toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const person = getPerson(item.personId);
          const isCompleted = item.status === 'completed';
          return (
            <View
              style={[
                styles.historyItem,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  marginHorizontal: spacing.lg,
                  marginBottom: 10,
                  ...shadows.sm,
                },
              ]}
            >
              <View style={styles.historyLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isCompleted ? colors.successLight : colors.dangerLight,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12, color: isCompleted ? colors.success : colors.danger }}>
                    {isCompleted ? '✓' : '—'}
                  </Text>
                </View>
                <View>
                  <View style={styles.historyTopRow}>
                    <Text style={[{ fontSize: 16, marginRight: 8 }]}>{item.nudge.emoji}</Text>
                    <Text
                      style={[
                        styles.historyTitle,
                        {
                          color: isCompleted ? colors.text : colors.textSecondary,
                          fontSize: typography.md,
                          fontFamily: fonts.bodyMedium,
                          textDecorationLine: !isCompleted ? 'line-through' : 'none',
                          opacity: !isCompleted ? 0.7 : 1,
                        },
                      ]}
                    >
                      {item.nudge.title}
                    </Text>
                  </View>
                  <Text style={[styles.historyPerson, { color: person.avatarColor, fontSize: typography.sm, fontFamily: fonts.body }]}>
                    {person.firstName}
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                {item.completedAt ? (
                  <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body }]}>
                    {formatTime(item.completedAt)}
                  </Text>
                ) : (
                  <Text style={[{ color: colors.danger, fontSize: typography.sm, fontFamily: fonts.body }]}>
                    Not done
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  return entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, HistoryEntry[]>);
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingBottom: 28,
  },
  title: {},
  sectionHeader: {
    paddingVertical: 14,
  },
  sectionHeaderText: {
    letterSpacing: 0.8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {},
  historyPerson: {
    marginTop: 3,
  },
  historyRight: {},
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  insightsCallout: {},
});

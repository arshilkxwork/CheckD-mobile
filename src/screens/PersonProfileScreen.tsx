import React from 'react';
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
import { Avatar } from '../components/Avatar';
import { NudgeCard } from '../components/NudgeCard';
import { EmptyState } from '../components/EmptyState';
import { RELATIONSHIP_CONFIG } from '../theme/tokens';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function PersonProfileScreen({ navigation, route }: any) {
  const { personId } = route.params;
  const { people, nudges, history, completeNudge, snoozeNudge } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;

  // Nudges sent to this person
  const personNudges = nudges.filter((n) => n.receiverId === personId);
  const todayNudges = personNudges.filter((n) => {
    const s = new Date(n.scheduledTime);
    const today = new Date();
    return s.toDateString() === today.toDateString() || n.repeat !== 'once';
  });

  const pendingNudges = todayNudges.filter(
    (n) => n.status === 'pending' || n.status === 'snoozed'
  );
  const completedNudges = todayNudges.filter((n) => n.status === 'completed');

  // Week streak — mock based on history
  const personHistory = history.filter((h) => h.personId === personId);
  const todayIdx = new Date().getDay(); // 0 = Sun
  const weekMap = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
    const date = new Date();
    date.setDate(date.getDate() - (todayIdx === 0 ? 6 : todayIdx - 1) + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    const entry = personHistory.find((h) => h.date === dateStr && h.status === 'completed');
    return { day: WEEKDAYS[dayOffset], completed: !!entry, isFuture: date > new Date() };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}
        >
          <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>← Back</Text>
        </TouchableOpacity>

        {/* Profile header */}
        <View style={[styles.profileHeader, { paddingHorizontal: spacing.lg }]}>
          <Avatar user={person} size={76} />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold },
              ]}
            >
              {person.firstName}
            </Text>
            {rel && (
              <Text style={[{ color: person.avatarColor, fontSize: typography.md, fontFamily: fonts.bodyMedium, marginTop: 4 }]}>
                {rel.emoji} {rel.label}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateNudge')}
            style={[
              styles.nudgePersonBtn,
              { backgroundColor: colors.accentLight, borderRadius: radius.full },
            ]}
          >
            <Text style={[{ color: colors.accent, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
              + Nudge
            </Text>
          </TouchableOpacity>
        </View>

        {/* This week */}
        <View style={[styles.sectionBox, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
            THIS WEEK
          </Text>
          <View style={styles.weekRow}>
            {weekMap.map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLabel, { color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>
                  {day.day}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: day.isFuture
                        ? colors.border
                        : day.completed
                        ? colors.success
                        : colors.dangerLight,
                    },
                  ]}
                >
                  {!day.isFuture && (
                    <Text style={{ fontSize: 10, color: day.completed ? '#fff' : colors.danger }}>
                      {day.completed ? '✓' : '–'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Today's nudges */}
        {pendingNudges.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.todayLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold, paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
              TODAY — PENDING
            </Text>
            {pendingNudges.map((n) => (
              <NudgeCard
                key={n.id}
                nudge={n}
                person={person}
                showPerson={false}
                onPress={() => navigation.navigate('NudgeDetail', { nudgeId: n.id })}
                onComplete={() => completeNudge(n.id)}
                onSnooze={() => snoozeNudge(n.id, 15)}
              />
            ))}
          </View>
        )}

        {completedNudges.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.todayLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold, paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
              TODAY — DONE
            </Text>
            {completedNudges.map((n) => (
              <NudgeCard
                key={n.id}
                nudge={n}
                person={person}
                showPerson={false}
                onPress={() => navigation.navigate('NudgeDetail', { nudgeId: n.id })}
              />
            ))}
          </View>
        )}

        {pendingNudges.length === 0 && completedNudges.length === 0 && (
          <EmptyState
            emoji="☀️"
            title="All clear"
            subtitle="No nudges scheduled for today."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {},
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  profileInfo: { flex: 1 },
  profileName: {},
  nudgePersonBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sectionBox: {
    padding: 20,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: { textTransform: 'uppercase' },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    letterSpacing: 0.5,
  },
});

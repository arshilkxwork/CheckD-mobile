import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { NudgeCard } from '../components/NudgeCard';
import { getGreeting } from '../utils/formatters';
import { User } from '../types';

export function HomeScreen({ navigation }: any) {
  const { currentUser, nudges, people, completeNudge, snoozeNudge, unreadCount } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;
  const [refreshing, setRefreshing] = useState(false);

  const greeting = getGreeting();
  const hour = new Date().getHours();
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  const todayNudges = nudges.filter((n) => {
    const scheduled = new Date(n.scheduledTime);
    const today = new Date();
    return scheduled.toDateString() === today.toDateString() || n.repeat !== 'once';
  });

  const sentByMe = todayNudges.filter((n) => n.creatorId === currentUser.id);
  const receivedByMe = todayNudges.filter((n) => n.receiverId === currentUser.id);

  const pendingSent = sentByMe.filter((n) => n.status === 'pending' || n.status === 'snoozed');
  const completedSent = sentByMe.filter((n) => n.status === 'completed');
  const pendingReceived = receivedByMe.filter((n) => n.status === 'pending' || n.status === 'snoozed');

  const totalPending = pendingSent.length + pendingReceived.length;
  const allDone = totalPending === 0 && (completedSent.length > 0 || sentByMe.length === 0);

  const getPerson = (id: string): User =>
    people.find((p) => p.id === id) || currentUser;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greetingLine, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
              {greeting} {greetingEmoji}
            </Text>
            <Text style={[styles.name, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
              {currentUser.firstName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllNudges')}
              activeOpacity={0.8}
              style={[
                styles.notifBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.full,
                  ...shadows.sm,
                },
              ]}
              accessibilityLabel="View All Nudges"
            >
              <Text style={{ fontSize: 18 }}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={[
                styles.notifBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.full,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Status banner ── */}
        {allDone && completedSent.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <View
              style={[
                styles.doneBanner,
                {
                  backgroundColor: colors.successLight,
                  borderRadius: radius.xxl,
                },
              ]}
            >
              <Text style={{ fontSize: 22 }}>✨</Text>
              <Text style={[{ color: colors.success, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
                All caught up today!
              </Text>
            </View>
          </View>
        ) : totalPending > 0 ? (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <View
              style={[
                styles.pendingBanner,
                {
                  backgroundColor: colors.accentSoft,
                  borderRadius: radius.xxl,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>💌</Text>
              <Text style={[{ color: colors.accentDark, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
                {totalPending} {totalPending === 1 ? 'nudge' : 'nudges'} need attention
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── All Nudges quick link ── */}
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AllNudges')}
            activeOpacity={0.85}
            style={[
              styles.allNudgesCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.sm,
              },
            ]}
          >
            <View style={styles.allNudgesCardLeft}>
              <View style={[styles.allNudgesIcon, { backgroundColor: colors.surfaceWarm, borderRadius: radius.lg }]}>
                <Text style={{ fontSize: 20 }}>📋</Text>
              </View>
              <View>
                <Text style={[{ color: colors.text, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
                  View all nudges ({nudges.length})
                </Text>
                <Text style={[{ color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body, marginTop: 2 }]}>
                  Search, filter & review across people
                </Text>
              </View>
            </View>
            <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Nudges for me ── */}
        {pendingReceived.length > 0 && (
          <Section label="For you 💌" colors={colors} typography={typography} fonts={fonts} spacing={spacing}>
            {pendingReceived.map((n) => (
              <NudgeCard
                key={n.id}
                nudge={n}
                person={getPerson(n.creatorId)}
                onPress={() => navigation.navigate('ReceiverNudge', { nudgeId: n.id })}
                onComplete={() => completeNudge(n.id)}
                onSnooze={() => snoozeNudge(n.id, 15)}
              />
            ))}
          </Section>
        )}

        {/* ── Sent by me — pending ── */}
        {pendingSent.length > 0 && (
          <Section label="Waiting on 🕊️" colors={colors} typography={typography} fonts={fonts} spacing={spacing}>
            {pendingSent.map((n) => (
              <NudgeCard
                key={n.id}
                nudge={n}
                person={getPerson(n.receiverId)}
                onPress={() => navigation.navigate('NudgeDetail', { nudgeId: n.id })}
              />
            ))}
          </Section>
        )}

        {/* ── Done today ── */}
        {completedSent.length > 0 && (
          <Section label="Done today 🌸" colors={colors} typography={typography} fonts={fonts} spacing={spacing}>
            {completedSent.map((n) => (
              <NudgeCard
                key={n.id}
                nudge={n}
                person={getPerson(n.receiverId)}
                onPress={() => navigation.navigate('NudgeDetail', { nudgeId: n.id })}
              />
            ))}
          </Section>
        )}

        {/* ── Truly empty ── */}
        {sentByMe.length === 0 && receivedByMe.length === 0 && (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surfaceWarm,
                  borderRadius: radius.xxxl,
                },
              ]}
            >
              <Text style={{ fontSize: 44, marginBottom: 16 }}>🌿</Text>
              <Text style={[{ color: colors.text, fontSize: typography.xl, fontFamily: fonts.heading, textAlign: 'center' }]}>
                Nothing yet
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, textAlign: 'center', marginTop: 8, lineHeight: typography.md * typography.lineHeightRelaxed }]}>
                Send your first nudge and let someone know you care.
              </Text>
            </View>
          </View>
        )}

        {/* ── Create CTA ── */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: 48 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateNudge')}
            activeOpacity={0.8}
            style={[
              styles.createBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.full,
                ...shadows.accent,
              },
            ]}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>💌</Text>
            <Text style={[{ color: '#fff', fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>
              Send a nudge
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children, colors, typography, fonts, spacing }: any) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text
        style={[
          styles.sectionLabel,
          {
            color: colors.textSecondary,
            fontSize: typography.sm,
            fontFamily: fonts.bodySemibold,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.sm,
            letterSpacing: 0.3,
          },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 28,
    paddingBottom: 26,
  },
  headerLeft: { flex: 1 },
  greetingLine: { marginBottom: 4 },
  name: { lineHeight: 38 },
  notifBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionLabel: {},
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  allNudgesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  allNudgesCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allNudgesIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

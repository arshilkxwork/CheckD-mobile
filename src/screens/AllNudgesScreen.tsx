import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Nudge, NudgeCategory, User } from '../types';
import { CATEGORY_CONFIG, RELATIONSHIP_CONFIG } from '../theme/tokens';
import { formatTime, formatRepeat } from '../utils/formatters';

type StatusFilter = 'all' | 'pending' | 'completed' | 'snoozed';
type DirectionFilter = 'all' | 'sent' | 'received';

export function AllNudgesScreen({ navigation }: any) {
  const { nudges, people, currentUser, completeNudge, snoozeNudge, deleteNudge } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getPerson = useCallback(
    (id: string): User =>
      people.find((p) => p.id === id) ||
      (id === currentUser.id
        ? currentUser
        : {
            id,
            name: 'Someone',
            firstName: 'Someone',
            avatarColor: colors.accent,
            accountabilityLevel: 'checkin',
            privacy: {
              showCompletedTasks: true,
              showExactTimes: true,
              showMedicationNames: false,
              shareHistory: true,
              requireProof: false,
            },
            notificationPrefs: {
              enabled: true,
              reminderInterval: 15,
              quietHoursStart: '22:00',
              quietHoursEnd: '07:00',
              sounds: true,
              vibration: true,
            },
            createdAt: new Date().toISOString(),
          }),
    [people, currentUser, colors.accent]
  );

  // Calculate high-level stats
  const totalCount = nudges.length;
  const pendingCount = nudges.filter((n) => n.status === 'pending' || n.status === 'snoozed').length;
  const completedCount = nudges.filter((n) => n.status === 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered nudges
  const filteredNudges = useMemo(() => {
    return nudges.filter((nudge) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const receiver = getPerson(nudge.receiverId);
        const creator = getPerson(nudge.creatorId);
        const matchesTitle = nudge.title.toLowerCase().includes(query);
        const matchesDesc = nudge.description?.toLowerCase().includes(query);
        const matchesCategory = nudge.category.toLowerCase().includes(query);
        const matchesReceiver = receiver.name.toLowerCase().includes(query);
        const matchesCreator = creator.name.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesReceiver && !matchesCreator) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter === 'pending' && nudge.status !== 'pending' && nudge.status !== 'snoozed') {
        return false;
      }
      if (statusFilter === 'completed' && nudge.status !== 'completed') {
        return false;
      }
      if (statusFilter === 'snoozed' && nudge.status !== 'snoozed') {
        return false;
      }

      // 3. Direction filter
      if (directionFilter === 'sent' && nudge.creatorId !== currentUser.id) {
        return false;
      }
      if (directionFilter === 'received' && nudge.receiverId !== currentUser.id) {
        return false;
      }

      // 4. Category filter
      if (categoryFilter !== 'all' && nudge.category !== categoryFilter) {
        return false;
      }

      // 5. Person filter
      if (personFilter !== 'all') {
        if (nudge.receiverId !== personFilter && nudge.creatorId !== personFilter) {
          return false;
        }
      }

      return true;
    });
  }, [nudges, searchQuery, statusFilter, directionFilter, categoryFilter, personFilter, currentUser.id, getPerson]);

  const handleDeleteNudge = (nudge: Nudge) => {
    Alert.alert(
      'Delete nudge',
      `Are you sure you want to delete "${nudge.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNudge(nudge.id),
        },
      ]
    );
  };

  const handleCardPress = (nudge: Nudge) => {
    if (nudge.receiverId === currentUser.id && nudge.status === 'pending') {
      navigation.navigate('ReceiverNudge', { nudgeId: nudge.id });
    } else {
      navigation.navigate('NudgeDetail', { nudgeId: nudge.id });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDirectionFilter('all');
    setCategoryFilter('all');
    setPersonFilter('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    directionFilter !== 'all' ||
    categoryFilter !== 'all' ||
    personFilter !== 'all';

  const categories = Object.keys(CATEGORY_CONFIG) as NudgeCategory[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, borderBottomColor: colors.divider }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.full }]}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.xl, fontFamily: fonts.headingBold }]}>
              All Nudges
            </Text>
            <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body }]}>
              {nudges.length} total across people
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateNudge')}
            style={[
              styles.createHeaderBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.full,
                ...shadows.accent,
              },
            ]}
          >
            <Text style={{ fontSize: 14, color: '#fff', marginRight: 4 }}>+</Text>
            <Text style={[{ color: '#fff', fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
              New
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Input ── */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="Search by title, person, category…"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              {
                color: colors.text,
                fontSize: typography.sm,
                fontFamily: fonts.body,
              },
            ]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* ── Overview Metrics Cards ── */}
        <View style={[styles.statsRow, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text style={[styles.statValue, { color: colors.text, fontSize: typography.xl, fontFamily: fonts.headingBold }]}>
              {totalCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>
              Total
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accentLight, borderRadius: radius.xl }]}>
            <Text style={[styles.statValue, { color: colors.accentDark, fontSize: typography.xl, fontFamily: fonts.headingBold }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.accentDark, fontSize: typography.xs, fontFamily: fonts.bodyMedium }]}>
              Pending
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.peachLight, borderRadius: radius.xl }]}>
            <Text style={[styles.statValue, { color: colors.peach, fontSize: typography.xl, fontFamily: fonts.headingBold }]}>
              {completedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body }]}>
              Done
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm }]}>
            <Text style={[styles.statValue, { color: colors.success, fontSize: typography.xl, fontFamily: fonts.headingBold }]}>
              {completionRate}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>
              Rate
            </Text>
          </View>
        </View>

        {/* ── Filter Tabs: Status ── */}
        <View style={{ marginTop: spacing.md }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.pillScroll, { paddingHorizontal: spacing.lg }]}
          >
            {(
              [
                { key: 'all', label: `All (${totalCount})` },
                { key: 'pending', label: `Pending (${pendingCount})` },
                { key: 'completed', label: `Completed (${completedCount})` },
                { key: 'snoozed', label: 'Snoozed' },
              ] as { key: StatusFilter; label: string }[]
            ).map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setStatusFilter(tab.key)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderRadius: radius.full,
                      ...(!active ? shadows.sm : {}),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: active ? '#fff' : colors.textSecondary,
                        fontSize: typography.xs,
                        fontFamily: active ? fonts.bodySemibold : fonts.bodyMedium,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Direction Filter (Sent vs Received) ── */}
        <View style={{ marginTop: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.pillScroll, { paddingHorizontal: spacing.lg }]}
          >
            {(
              [
                { key: 'all', label: 'All roles', emoji: '👥' },
                { key: 'sent', label: 'Sent by me', emoji: '🕊️' },
                { key: 'received', label: 'For me', emoji: '💌' },
              ] as { key: DirectionFilter; label: string; emoji: string }[]
            ).map((dir) => {
              const active = directionFilter === dir.key;
              return (
                <TouchableOpacity
                  key={dir.key}
                  onPress={() => setDirectionFilter(dir.key)}
                  style={[
                    styles.subPill,
                    {
                      backgroundColor: active ? colors.surfaceWarm : 'transparent',
                      borderColor: active ? colors.borderStrong : colors.border,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12, marginRight: 5 }}>{dir.emoji}</Text>
                  <Text
                    style={[
                      {
                        color: active ? colors.text : colors.textSecondary,
                        fontSize: typography.xs,
                        fontFamily: active ? fonts.bodySemibold : fonts.body,
                      },
                    ]}
                  >
                    {dir.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Category Chips ── */}
        <View style={{ marginTop: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.pillScroll, { paddingHorizontal: spacing.lg }]}
          >
            <TouchableOpacity
              onPress={() => setCategoryFilter('all')}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryFilter === 'all' ? colors.accentLight : colors.surfaceSubtle,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: categoryFilter === 'all' ? colors.accentDark : colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: categoryFilter === 'all' ? fonts.bodySemibold : fonts.body,
                  },
                ]}
              >
                🌿 All categories
              </Text>
            </TouchableOpacity>

            {categories.map((catKey) => {
              const cat = CATEGORY_CONFIG[catKey];
              const active = categoryFilter === catKey;
              return (
                <TouchableOpacity
                  key={catKey}
                  onPress={() => setCategoryFilter(active ? 'all' : catKey)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.accentLight : colors.surfaceSubtle,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      {
                        color: active ? colors.accentDark : colors.textSecondary,
                        fontSize: typography.xs,
                        fontFamily: active ? fonts.bodySemibold : fonts.body,
                      },
                    ]}
                  >
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── People Chips ── */}
        <View style={{ marginTop: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.pillScroll, { paddingHorizontal: spacing.lg }]}
          >
            <TouchableOpacity
              onPress={() => setPersonFilter('all')}
              style={[
                styles.personChip,
                {
                  backgroundColor: personFilter === 'all' ? colors.peachLight : 'transparent',
                  borderColor: personFilter === 'all' ? colors.peach : colors.divider,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: personFilter === 'all' ? colors.peach : colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: personFilter === 'all' ? fonts.bodySemibold : fonts.body,
                  },
                ]}
              >
                All People
              </Text>
            </TouchableOpacity>

            {people.map((person) => {
              const active = personFilter === person.id;
              return (
                <TouchableOpacity
                  key={person.id}
                  onPress={() => setPersonFilter(active ? 'all' : person.id)}
                  style={[
                    styles.personChip,
                    {
                      backgroundColor: active ? person.avatarColor + '18' : 'transparent',
                      borderColor: active ? person.avatarColor : colors.divider,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <View style={[styles.avatarDot, { backgroundColor: person.avatarColor }]} />
                  <Text
                    style={[
                      {
                        color: active ? person.avatarColor : colors.textSecondary,
                        fontSize: typography.xs,
                        fontFamily: active ? fonts.bodySemibold : fonts.body,
                      },
                    ]}
                  >
                    {person.firstName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Filter Info & Count Bar ── */}
        <View style={[styles.countRow, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
            Showing {filteredNudges.length} {filteredNudges.length === 1 ? 'nudge' : 'nudges'}
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={resetFilters}>
              <Text style={[{ color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
                Clear filters
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Nudge List ── */}
        {filteredNudges.length === 0 ? (
          <View style={[styles.emptyContainer, { paddingHorizontal: spacing.lg, marginTop: 40 }]}>
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceWarm, borderRadius: radius.xxl }]}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>🔍</Text>
              <Text style={[{ color: colors.text, fontSize: typography.lg, fontFamily: fonts.headingBold, textAlign: 'center' }]}>
                No nudges found
              </Text>
              <Text
                style={[
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sm,
                    fontFamily: fonts.body,
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: typography.sm * typography.lineHeightRelaxed,
                  },
                ]}
              >
                {hasActiveFilters
                  ? "We couldn't find any nudges matching your active search or filters."
                  : 'You have not added any nudges yet.'}
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity
                  onPress={resetFilters}
                  style={[styles.resetBtn, { backgroundColor: colors.accent, borderRadius: radius.full, marginTop: 20 }]}
                >
                  <Text style={[{ color: '#fff', fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
                    Reset all filters
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateNudge')}
                  style={[styles.resetBtn, { backgroundColor: colors.accent, borderRadius: radius.full, marginTop: 20 }]}
                >
                  <Text style={[{ color: '#fff', fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
                    + Create your first nudge
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            {filteredNudges.map((nudge) => {
              const receiver = getPerson(nudge.receiverId);
              const creator = getPerson(nudge.creatorId);
              const isOwner = nudge.creatorId === currentUser.id;
              const isPending = nudge.status === 'pending' || nudge.status === 'snoozed';
              const isCompleted = nudge.status === 'completed';
              const isSnoozed = nudge.status === 'snoozed';

              const rel = receiver.relationship ? RELATIONSHIP_CONFIG[receiver.relationship] : null;

              const statusColor = isCompleted
                ? colors.success
                : isSnoozed
                ? colors.warning
                : colors.accent;
              const statusBg = isCompleted
                ? colors.successLight
                : isSnoozed
                ? colors.warningLight
                : colors.accentLight;

              return (
                <TouchableOpacity
                  key={nudge.id}
                  onPress={() => handleCardPress(nudge)}
                  activeOpacity={0.85}
                  style={[
                    styles.nudgeCard,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: radius.xxl,
                      marginHorizontal: spacing.lg,
                      marginBottom: 12,
                      ...shadows.sm,
                      opacity: isCompleted ? 0.78 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    {/* Big Emoji */}
                    <View style={[styles.emojiBox, { backgroundColor: colors.surfaceWarm, borderRadius: radius.xl }]}>
                      <Text style={{ fontSize: 26 }}>{nudge.emoji}</Text>
                    </View>

                    {/* Titles */}
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      {/* Recipient / Sender Row */}
                      <View style={styles.personHeaderRow}>
                        <View style={[styles.personDot, { backgroundColor: receiver.avatarColor }]} />
                        <Text style={[styles.personLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
                          {isOwner ? `For ${receiver.firstName}` : `From ${creator.firstName}`}
                        </Text>
                        {rel && (
                          <Text style={{ fontSize: 11, marginLeft: 4 }}>{rel.emoji}</Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.nudgeTitleText,
                          {
                            color: colors.text,
                            fontSize: typography.md,
                            fontFamily: fonts.bodySemibold,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {nudge.title}
                      </Text>

                      {nudge.description ? (
                        <Text
                          numberOfLines={1}
                          style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body, marginTop: 2 }]}
                        >
                          {nudge.description}
                        </Text>
                      ) : null}
                    </View>

                    {/* Status Pill */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBg, borderRadius: radius.full }]}>
                      <Text style={[{ color: statusColor, fontSize: 11, fontFamily: fonts.bodySemibold }]}>
                        {isCompleted ? '✓ Done' : isSnoozed ? '⏱ Snoozed' : '⏳ Active'}
                      </Text>
                    </View>
                  </View>

                  {/* Schedule & Info Row */}
                  <View style={[styles.metaRow, { borderTopColor: colors.divider, borderTopWidth: 1 }]}>
                    <View style={styles.metaItem}>
                      <Text style={{ fontSize: 12 }}>⏰</Text>
                      <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium }]}>
                        {formatTime(nudge.scheduledTime)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={{ fontSize: 12 }}>🔁</Text>
                      <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium }]}>
                        {formatRepeat(nudge.repeat)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={{ fontSize: 12 }}>🏷️</Text>
                      <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium, textTransform: 'capitalize' }]}>
                        {nudge.category}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.divider, borderTopWidth: 1 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      {isPending && (
                        <TouchableOpacity
                          onPress={() => completeNudge(nudge.id)}
                          style={[
                            styles.quickDoneBtn,
                            { backgroundColor: colors.accentLight, borderRadius: radius.full },
                          ]}
                        >
                          <Text style={[{ color: colors.accentDark, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
                            ✓ Done
                          </Text>
                        </TouchableOpacity>
                      )}
                      {isPending && (
                        <TouchableOpacity
                          onPress={() => snoozeNudge(nudge.id, 15)}
                          style={[
                            styles.quickSnoozeBtn,
                            { backgroundColor: colors.surfaceWarm, borderRadius: radius.full },
                          ]}
                        >
                          <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium }]}>
                            ⏰ +15m
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => navigation.navigate('NudgeDetail', { nudgeId: nudge.id })}
                        style={[
                          styles.viewDetailsBtn,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            borderRadius: radius.full,
                          },
                        ]}
                      >
                        <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium }]}>
                          Details →
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {isOwner && (
                      <TouchableOpacity
                        onPress={() => handleDeleteNudge(nudge)}
                        style={styles.deleteIconButton}
                      >
                        <Text style={{ fontSize: 14 }}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    letterSpacing: -0.3,
  },
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    lineHeight: 28,
  },
  statLabel: {
    marginTop: 2,
  },
  pillScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabPillText: {},
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 6,
  },
  avatarDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyBox: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  nudgeCard: {
    overflow: 'hidden',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiBox: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  personDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  personLabel: {
    letterSpacing: 0.3,
  },
  nudgeTitleText: {
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
  },
  quickDoneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  quickSnoozeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewDetailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteIconButton: {
    padding: 6,
  },
});

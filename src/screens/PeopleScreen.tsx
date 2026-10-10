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
import { RELATIONSHIP_CONFIG } from '../theme/tokens';
import { User } from '../types';

export function PeopleScreen({ navigation }: any) {
  const { people, nudges } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const getPersonStats = (personId: string) => {
    const pNudges = nudges.filter((n) => n.receiverId === personId && n.repeat !== 'once');
    const completed = pNudges.filter((n) => n.status === 'completed').length;
    const pending = pNudges.filter((n) => n.status === 'pending' || n.status === 'snoozed').length;
    return { total: pNudges.length, completed, pending };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.xxxl, fontFamily: fonts.headingBold }]}>
            Your circle
          </Text>
          <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 6 }]}>
            People you care about ❤️
          </Text>
        </View>

        {people.length === 0 ? (
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
                Add someone you love
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, textAlign: 'center', marginTop: 10, lineHeight: typography.md * typography.lineHeightRelaxed }]}>
                Your accountability circle starts here.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.list, { paddingHorizontal: spacing.lg }]}>
            {people.map((person) => {
              const stats = getPersonStats(person.id);
              const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;
              return (
                <PersonCard
                  key={person.id}
                  person={person}
                  stats={stats}
                  rel={rel}
                  onPress={() => navigation.navigate('PersonProfile', { personId: person.id })}
                  colors={colors}
                  typography={typography}
                  fonts={fonts}
                  radius={radius}
                  shadows={shadows}
                />
              );
            })}
          </View>
        )}

        {/* Add person */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddPerson')}
            activeOpacity={0.82}
            style={[
              styles.addBtn,
              {
                borderColor: colors.border,
                borderRadius: radius.xxl,
                backgroundColor: colors.surfaceSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.addIcon,
                {
                  backgroundColor: colors.accentLight,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text style={{ color: colors.accent, fontSize: 18, fontFamily: fonts.heading }}>+</Text>
            </View>
            <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
              Add someone
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PersonCard({
  person, stats, rel, onPress,
  colors, typography, fonts, radius, shadows,
}: {
  person: User; stats: any; rel: any; onPress: () => void;
  colors: any; typography: any; fonts: any; radius: any; shadows: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={[
        styles.personCard,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xxl,
          ...shadows.sm,
        },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: person.avatarColor + '18', borderRadius: radius.full }]}>
        <Text style={[styles.avatarText, { color: person.avatarColor, fontFamily: fonts.heading }]}>
          {person.firstName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.personInfo}>
        <View style={styles.nameRow}>
          <Text style={[{ color: colors.text, fontSize: typography.lg, fontFamily: fonts.heading }]}>
            {person.firstName}
          </Text>
          {rel && <Text style={{ fontSize: 15, marginLeft: 6 }}>{rel.emoji}</Text>}
        </View>
        <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 3 }]}>
          {rel?.label ?? 'Connection'}
        </Text>
      </View>

      {/* Status badge */}
      <View style={styles.badgeArea}>
        {stats.pending > 0 ? (
          <View style={[styles.statBadge, { backgroundColor: colors.warningLight, borderRadius: radius.full }]}>
            <Text style={[{ color: colors.warning, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
              {stats.pending} pending
            </Text>
          </View>
        ) : stats.completed > 0 ? (
          <View style={[styles.statBadge, { backgroundColor: colors.successLight, borderRadius: radius.full }]}>
            <Text style={[{ color: colors.success, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
              ✓ Done
            </Text>
          </View>
        ) : (
          <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body }]}>—</Text>
        )}
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 56 },
  header: { paddingTop: 28, paddingBottom: 24 },
  title: {},
  list: { gap: 12 },
  emptyCard: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 22 },
  personInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  badgeArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  chevron: { fontSize: 24, fontWeight: '300' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

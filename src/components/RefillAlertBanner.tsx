import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Medication, User } from '../types';
import { calculateDaysRemaining } from '../utils/medications';

interface RefillAlertBannerProps {
  lowMeds: Medication[];
  people: User[];
  onPressManage: () => void;
  onPressQuickRefill?: (med: Medication) => void;
  compact?: boolean;
}

export function RefillAlertBanner({
  lowMeds,
  people,
  onPressManage,
  onPressQuickRefill,
  compact = false,
}: RefillAlertBannerProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows, spacing } = theme;

  if (!lowMeds || lowMeds.length === 0) {
    return null;
  }

  const primaryMed = lowMeds[0];
  const primaryPerson = people.find((p) => p.id === primaryMed.personId);
  const daysLeft = calculateDaysRemaining(primaryMed.currentSupply, primaryMed.times.length || 1);

  const headline =
    lowMeds.length === 1
      ? `${primaryPerson?.firstName || 'Loved one'}'s ${primaryMed.name} is running low`
      : `${lowMeds.length} medications require refill soon`;

  const subline =
    lowMeds.length === 1
      ? `Only ${primaryMed.currentSupply} ${primaryMed.unit} left (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} supply). Order now to avoid missing a dose.`
      : `Tap to review supplies for ${people.find((p) => p.id === lowMeds[0].personId)?.firstName || 'family'} and others.`;

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressManage}
        style={[
          styles.compactContainer,
          {
            backgroundColor: '#FFF4EC',
            borderColor: '#FDD8C7',
            borderRadius: radius.xl,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            ...shadows.sm,
          },
        ]}
      >
        <View style={styles.compactRow}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.compactTitle,
                { color: colors.accentDark, fontSize: typography.xs, fontFamily: fonts.bodyBold },
              ]}
              numberOfLines={1}
            >
              {headline}
            </Text>
            <Text
              style={[
                styles.compactSub,
                { color: colors.textSecondary, fontSize: 11, fontFamily: fonts.body },
              ]}
              numberOfLines={1}
            >
              {primaryMed.currentSupply} {primaryMed.unit} remaining
            </Text>
          </View>
          <Text style={[{ color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
            Refill →
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.fullContainer,
        {
          backgroundColor: '#FFF5EE',
          borderColor: '#FED7C3',
          borderRadius: radius.xxl,
          padding: spacing.md,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.badgeWrap, { backgroundColor: '#FFE6D5', borderRadius: radius.full }]}>
          <Text style={{ fontSize: 18 }}>💊</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.title, { color: colors.accentDark, fontSize: typography.sm, fontFamily: fonts.bodyBold }]}>
              {headline}
            </Text>
            <View style={[styles.pillBadge, { backgroundColor: colors.accent, borderRadius: radius.full }]}>
              <Text style={{ color: '#fff', fontSize: 10, fontFamily: fonts.bodyBold }}>
                LOW SUPPLY
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body, marginTop: 3 },
            ]}
          >
            {subline}
          </Text>
        </View>
      </View>

      <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
        {onPressQuickRefill && lowMeds.length === 1 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPressQuickRefill(primaryMed)}
            style={[
              styles.quickRefillBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text style={[{ color: '#fff', fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
              + Quick Refill (+30)
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressManage}
          style={[
            styles.manageBtn,
            {
              backgroundColor: '#fff',
              borderColor: '#FDC4A8',
              borderRadius: radius.full,
            },
          ]}
        >
          <Text style={[{ color: colors.accentDark, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>
            Manage Care Cabinet →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  badgeWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    letterSpacing: 0.2,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  subtitle: {
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickRefillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  manageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  compactContainer: {
    borderWidth: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {},
  compactSub: {
    marginTop: 1,
  },
});

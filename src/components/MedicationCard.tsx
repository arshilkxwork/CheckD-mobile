import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Medication, User } from '../types';
import {
  getFormEmoji,
  getFormLabel,
  getFrequencyLabel,
  formatScheduledTimes,
  getSupplyStatus,
} from '../utils/medications';

interface MedicationCardProps {
  medication: Medication;
  person?: User;
  isTakenToday?: boolean;
  onLogDose: (med: Medication) => void;
  onRefill: (med: Medication) => void;
  onPress?: (med: Medication) => void;
  showPersonBadge?: boolean;
}

export function MedicationCard({
  medication,
  person,
  isTakenToday = false,
  onLogDose,
  onRefill,
  onPress,
  showPersonBadge = true,
}: MedicationCardProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows, spacing } = theme;

  const supplyInfo = getSupplyStatus(medication);
  const emoji = getFormEmoji(medication.form);
  const formLabel = getFormLabel(medication.form);
  const freqLabel = getFrequencyLabel(medication.frequency);
  const timesLabel = formatScheduledTimes(medication.times);

  const handleLogDose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onLogDose(medication);
  };

  const handleRefill = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onRefill(medication);
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={() => onPress && onPress(medication)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xxl,
          borderWidth: 1,
          borderColor: supplyInfo.status === 'low' ? '#FED7C3' : colors.border,
          padding: spacing.lg,
          ...shadows.sm,
        },
      ]}
    >
      {/* ── Top Header Row ── */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: medication.color ? `${medication.color}15` : colors.accentLight,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Text
                style={[
                  styles.name,
                  { color: colors.text, fontSize: typography.md, fontFamily: fonts.headingBold },
                ]}
              >
                {medication.name}
              </Text>
              <View
                style={[
                  styles.dosageTag,
                  { backgroundColor: colors.surfaceWarm, borderRadius: radius.full },
                ]}
              >
                <Text style={[{ color: colors.textSecondary, fontSize: 11, fontFamily: fonts.bodyBold }]}>
                  {medication.dosage}
                </Text>
              </View>
            </View>

            {/* Recipient & Form info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {showPersonBadge && person && (
                <View
                  style={[
                    styles.personBadge,
                    {
                      backgroundColor: `${person.avatarColor || colors.accent}18`,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      {
                        color: person.avatarColor || colors.accentDark,
                        fontSize: 11,
                        fontFamily: fonts.bodyBold,
                      },
                    ]}
                  >
                    {person.firstName}
                  </Text>
                </View>
              )}
              <Text style={[{ color: colors.textTertiary, fontSize: typography.xs, fontFamily: fonts.body }]}>
                {formLabel} • {freqLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.supplyStatusBadge,
            { backgroundColor: supplyInfo.badgeBg, borderRadius: radius.full },
          ]}
        >
          <Text style={[{ color: supplyInfo.color, fontSize: 10, fontFamily: fonts.bodyBold }]}>
            {supplyInfo.status === 'low'
              ? 'LOW STOCK'
              : supplyInfo.status === 'empty'
              ? 'EMPTY'
              : `${supplyInfo.percentage}%`}
          </Text>
        </View>
      </View>

      {/* ── Schedule and Instructions ── */}
      <View style={[styles.scheduleRow, { backgroundColor: colors.surfaceWarm, borderRadius: radius.lg }]}>
        <Text style={{ fontSize: 14 }}>⏰</Text>
        <Text
          style={[
            styles.scheduleText,
            { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyMedium },
          ]}
        >
          {timesLabel}
        </Text>
        {isTakenToday && (
          <View style={[styles.takenPill, { backgroundColor: colors.successLight, borderRadius: radius.full }]}>
            <Text style={[{ color: colors.success, fontSize: 10, fontFamily: fonts.bodyBold }]}>
              ✓ TAKEN TODAY
            </Text>
          </View>
        )}
      </View>

      {medication.instructions ? (
        <Text
          numberOfLines={2}
          style={[
            styles.instructionsText,
            { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body, marginTop: spacing.sm },
          ]}
        >
          💬 {medication.instructions}
        </Text>
      ) : null}

      {/* ── Supply Progress Bar ── */}
      <View style={[styles.supplySection, { marginTop: spacing.md }]}>
        <View style={styles.supplyHeaderRow}>
          <Text style={[{ color: colors.textTertiary, fontSize: 11, fontFamily: fonts.bodyMedium }]}>
            Current Supply
          </Text>
          <Text style={[{ color: supplyInfo.color, fontSize: 11, fontFamily: fonts.bodyBold }]}>
            {supplyInfo.label}
          </Text>
        </View>
        <View style={[styles.trackBg, { backgroundColor: colors.divider, borderRadius: radius.full }]}>
          <View
            style={[
              styles.trackFill,
              {
                width: `${Math.max(4, supplyInfo.percentage)}%`,
                backgroundColor: supplyInfo.color,
                borderRadius: radius.full,
              },
            ]}
          />
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogDose}
          style={[
            styles.logDoseBtn,
            {
              backgroundColor: isTakenToday ? colors.surfaceWarm : colors.accent,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Text
            style={[
              {
                color: isTakenToday ? colors.textSecondary : '#FFFFFF',
                fontSize: typography.xs,
                fontFamily: fonts.bodyBold,
              },
            ]}
          >
            {isTakenToday ? '✓ Dose Recorded' : '✓ Log Dose'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRefill}
          style={[
            styles.refillBtn,
            {
              backgroundColor: colors.surfaceWarm,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Text
            style={[
              {
                color: colors.text,
                fontSize: typography.xs,
                fontFamily: fonts.bodySemibold,
              },
            ]}
          >
            ↻ Refill
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    letterSpacing: 0.1,
  },
  dosageTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  personBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  supplyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
  },
  scheduleText: {
    flex: 1,
  },
  takenPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  instructionsText: {
    lineHeight: 16,
  },
  supplySection: {
    gap: 4,
  },
  supplyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackBg: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logDoseBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

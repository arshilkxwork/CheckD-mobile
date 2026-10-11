import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Avatar } from '../components/Avatar';

export function MeScreen({ navigation }: any) {
  const { currentUser, setCurrentUser, nudges } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.firstName);

  const accountabilityOptions = [
    {
      key: 'trust',
      label: 'Trust',
      desc: 'Just confirm when done.',
      emoji: '🤝',
    },
    {
      key: 'checkin',
      label: 'Check-in',
      desc: 'Confirm + optional note.',
      emoji: '✅',
    },
    {
      key: 'strict',
      label: 'Strict',
      desc: 'Full confirmation required.',
      emoji: '🔒',
    },
  ];

  const updatePrivacy = (key: keyof typeof currentUser.privacy, value: boolean) => {
    setCurrentUser({
      ...currentUser,
      privacy: { ...currentUser.privacy, [key]: value },
    });
  };

  const updateNotifPref = (key: keyof typeof currentUser.notificationPrefs, value: any) => {
    setCurrentUser({
      ...currentUser,
      notificationPrefs: { ...currentUser.notificationPrefs, [key]: value },
    });
  };

  const saveName = () => {
    if (nameInput.trim().length > 0) {
      setCurrentUser({ ...currentUser, firstName: nameInput.trim(), name: nameInput.trim() });
    }
    setEditingName(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 72 }}>
        {/* Header */}
        <View style={[styles.profileHeader, { paddingHorizontal: spacing.lg, paddingTop: 24 }]}>
          <Avatar user={currentUser} size={76} />
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  onBlur={saveName}
                  autoFocus
                  style={[
                    styles.nameInput,
                    {
                      color: colors.text,
                      fontSize: typography.xxl,
                      fontFamily: fonts.headingBold,
                      borderBottomColor: colors.accent,
                    },
                  ]}
                />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={[styles.profileName, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
                  {currentUser.firstName}
                </Text>
                <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 4 }]}>
                  Tap to edit ✏️
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Nudges & Habits */}
        <SectionHeader label="Nudges & Habits" colors={colors} typography={typography} fonts={fonts} spacing={spacing} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Insights')}
            activeOpacity={0.75}
            style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
          >
            <Text style={{ fontSize: 22 }}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
                Care Insights & Streaks
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 2 }]}>
                Track consistency, weekly adherence & unlocked badges
              </Text>
            </View>
            <Text style={[{ color: colors.accent, fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('Routines')}
            activeOpacity={0.75}
            style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
          >
            <Text style={{ fontSize: 22 }}>🌿</Text>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
                Care Routine Templates
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 2 }]}>
                Curated 1-tap habit bundles for parents & partners
              </Text>
            </View>
            <Text style={[{ color: colors.accent, fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('AllNudges')}
            activeOpacity={0.75}
            style={styles.menuRow}
          >
            <Text style={{ fontSize: 22 }}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
                All Nudges ({nudges.length})
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, marginTop: 2 }]}>
                Search, filter, and review all care nudges
              </Text>
            </View>
            <Text style={[{ color: colors.accent, fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Accountability */}
        <SectionHeader label="Accountability" colors={colors} typography={typography} fonts={fonts} spacing={spacing} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          {accountabilityOptions.map((opt, i) => {
            const isSelected = currentUser.accountabilityLevel === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setCurrentUser({ ...currentUser, accountabilityLevel: opt.key as any })}
                style={[
                  styles.accountabilityRow,
                  {
                    borderBottomWidth: i < accountabilityOptions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.divider,
                    backgroundColor: isSelected ? colors.accentLight : 'transparent',
                    borderRadius: isSelected ? radius.lg : 0,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: isSelected ? fonts.bodySemibold : fonts.body }]}>
                    {opt.label}
                  </Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body, lineHeight: typography.sm * typography.lineHeightBody }]}>
                    {opt.desc}
                  </Text>
                </View>
                {isSelected && <Text style={{ color: colors.accent, fontFamily: fonts.bodySemibold }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Privacy */}
        <SectionHeader label="Privacy" colors={colors} typography={typography} fonts={fonts} spacing={spacing} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          {(
            [
              { key: 'showCompletedTasks', label: 'Show completed tasks', desc: "People can see when you've finished" },
              { key: 'showExactTimes', label: 'Show exact times', desc: 'Share precise completion timestamps' },
              { key: 'showMedicationNames', label: 'Show medication names', desc: 'Reveal specific medication labels' },
              { key: 'shareHistory', label: 'Share history', desc: 'Allow others to view past activity' },
              { key: 'requireProof', label: 'Require proof', desc: 'Must attach a note or photo' },
            ] as { key: keyof typeof currentUser.privacy; label: string; desc: string }[]
          ).map((item, i, arr) => (
            <View
              key={item.key}
              style={[
                styles.toggleRow,
                {
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>{item.label}</Text>
                <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body, lineHeight: typography.sm * typography.lineHeightBody }]}>{item.desc}</Text>
              </View>
              <Switch
                value={currentUser.privacy[item.key]}
                onValueChange={(v) => updatePrivacy(item.key, v)}
                trackColor={{ false: colors.border, true: colors.accentMid }}
                thumbColor={currentUser.privacy[item.key] ? colors.accent : colors.textTertiary}
              />
            </View>
          ))}
        </View>

        {/* Notifications */}
        <SectionHeader label="Notifications" colors={colors} typography={typography} fonts={fonts} spacing={spacing} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          {(
            [
              { key: 'enabled', label: 'Enable notifications', desc: 'Receive nudge alerts' },
              { key: 'sounds', label: 'Sound', desc: 'Play notification sounds' },
              { key: 'vibration', label: 'Vibration', desc: 'Vibrate on nudges' },
            ] as { key: keyof typeof currentUser.notificationPrefs; label: string; desc: string }[]
          ).map((item, i, arr) => (
            <View
              key={item.key}
              style={[
                styles.toggleRow,
                {
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>{item.label}</Text>
                <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body, lineHeight: typography.sm * typography.lineHeightBody }]}>{item.desc}</Text>
              </View>
              <Switch
                value={currentUser.notificationPrefs[item.key] as boolean}
                onValueChange={(v) => updateNotifPref(item.key, v)}
                trackColor={{ false: colors.border, true: colors.accentMid }}
                thumbColor={(currentUser.notificationPrefs[item.key] as boolean) ? colors.accent : colors.textTertiary}
              />
            </View>
          ))}
        </View>

        {/* Proof types */}
        <SectionHeader label="Proof types" colors={colors} typography={typography} fonts={fonts} spacing={spacing} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xxl, marginHorizontal: spacing.lg, ...shadows.sm }]}>
          {[
            { emoji: '✓', label: 'One-tap confirmation', desc: 'Quick tap to confirm' },
            { emoji: '📸', label: 'Photo proof', desc: 'Snap a photo as confirmation' },
            { emoji: '📝', label: 'Note', desc: 'Write a short message' },
            { emoji: '🎤', label: 'Voice confirmation', desc: 'Record a voice message' },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.proofRow,
                {
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>{item.label}</Text>
                <Text style={[{ color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body }]}>{item.desc}</Text>
              </View>
              <View style={[styles.comingSoon, { backgroundColor: colors.accentLight, borderRadius: radius.full }]}>
                <Text style={[{ color: colors.accent, fontSize: typography.xs, fontFamily: fonts.bodySemibold }]}>Soon</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textTertiary, fontSize: typography.sm, fontFamily: fonts.body }]}>
          CheckD v1.0.0 — Built with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, colors, typography, fonts, spacing }: any) {
  return (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: colors.textSecondary,
          fontSize: typography.sm,
          fontFamily: fonts.bodySemibold,
          paddingHorizontal: spacing.lg,
          letterSpacing: 0.5,
        },
      ]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 28,
  },
  profileInfo: { flex: 1 },
  profileName: {},
  nameEditRow: {},
  nameInput: {
    borderBottomWidth: 2,
    paddingVertical: 6,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    overflow: 'hidden',
  },
  accountabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  comingSoon: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  version: {
    textAlign: 'center',
    marginTop: 36,
  },
});

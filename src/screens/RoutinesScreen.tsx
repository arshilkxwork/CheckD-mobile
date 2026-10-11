import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CARE_ROUTINE_TEMPLATES } from '../data/routineTemplates';
import { CareRoutineTemplate } from '../types';

export function RoutinesScreen({ navigation }: any) {
  const { people, applyRoutineTemplate } = useApp();
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, spacing, shadows } = theme;

  const [activeFilter, setActiveFilter] = useState<'all' | 'parent' | 'partner' | 'child' | 'recovery'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CareRoutineTemplate | null>(null);
  const [targetPersonId, setTargetPersonId] = useState<string>(people[0]?.id || '');
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const filteredTemplates = CARE_ROUTINE_TEMPLATES.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'parent') return t.recommendedFor.includes('parent');
    if (activeFilter === 'partner') return t.recommendedFor.includes('partner');
    if (activeFilter === 'child') return t.recommendedFor.includes('child');
    if (activeFilter === 'recovery') return t.id.includes('recovery');
    return true;
  });

  const handleApply = () => {
    if (!selectedTemplate || !targetPersonId) return;
    const count = applyRoutineTemplate(selectedTemplate.id, targetPersonId);
    setAppliedCount(count);

    setTimeout(() => {
      setAppliedCount(null);
      setSelectedTemplate(null);
      navigation.navigate('Home');
    }, 1400);
  };

  const selectedPerson = people.find((p) => p.id === targetPersonId);

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
              Care Routines
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body },
              ]}
            >
              Curated daily habit bundles for loved ones
            </Text>
          </View>
        </View>

        {/* ── Filter Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'all', label: 'All Routines ✨' },
            { id: 'parent', label: 'Parents 🌿' },
            { id: 'partner', label: 'Partners ❤️' },
            { id: 'child', label: 'Kids 🎒' },
            { id: 'recovery', label: 'Healing & Recovery 🩹' },
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveFilter(tab.id as any)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderRadius: radius.full,
                    ...shadows.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    {
                      color: isSelected ? '#fff' : colors.text,
                      fontSize: typography.xs,
                      fontFamily: isSelected ? fonts.bodyBold : fonts.bodyMedium,
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

      {/* ── Routine Cards ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }}
      >
        {filteredTemplates.map((template) => (
          <View
            key={template.id}
            style={[
              styles.templateCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xxl,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.lg,
                marginBottom: spacing.lg,
                ...shadows.sm,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.emojiBox,
                    { backgroundColor: colors.surfaceWarm, borderRadius: radius.lg },
                  ]}
                >
                  <Text style={{ fontSize: 28 }}>{template.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Text
                      style={[
                        styles.templateTitle,
                        { color: colors.text, fontSize: typography.md, fontFamily: fonts.headingBold },
                      ]}
                    >
                      {template.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body, marginTop: 2 },
                    ]}
                  >
                    {template.subtitle}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: `${template.badgeColor}22`, borderRadius: radius.full },
                ]}
              >
                <Text
                  style={[
                    { color: template.badgeColor, fontSize: 10, fontFamily: fonts.bodyBold },
                  ]}
                >
                  {template.badge.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.description,
                {
                  color: colors.textSecondary,
                  fontSize: typography.xs,
                  fontFamily: fonts.body,
                  lineHeight: typography.xs * typography.lineHeightBody,
                  marginTop: spacing.md,
                },
              ]}
            >
              {template.description}
            </Text>

            {/* Included nudges preview */}
            <View
              style={[
                styles.itemsBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: radius.xl,
                  marginTop: spacing.md,
                  padding: spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.itemsTitle,
                  { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.bodySemibold, marginBottom: 8 },
                ]}
              >
                INCLUDED HABITS ({template.items.length})
              </Text>
              <View style={{ gap: 8 }}>
                {template.items.map((item) => (
                  <View key={item.id} style={styles.nudgeItemRow}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          { color: colors.text, fontSize: typography.xs, fontFamily: fonts.bodySemibold },
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text
                          style={[
                            { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body },
                          ]}
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.timePill,
                        { backgroundColor: colors.surfaceWarm, borderRadius: radius.sm },
                      ]}
                    >
                      <Text
                        style={[
                          { color: colors.textSecondary, fontSize: 10, fontFamily: fonts.bodySemibold },
                        ]}
                      >
                        {item.timeLabel}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => setSelectedTemplate(template)}
              activeOpacity={0.8}
              style={[
                styles.applyBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.full,
                  marginTop: spacing.md,
                  ...shadows.accent,
                },
              ]}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>✨</Text>
              <Text
                style={[
                  { color: '#fff', fontSize: typography.sm, fontFamily: fonts.bodyBold },
                ]}
              >
                Apply Routine to Loved One
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ── Assign Person Modal ── */}
      <Modal
        visible={!!selectedTemplate}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(45, 49, 57, 0.45)' }]}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xxxl,
                padding: spacing.xl,
                ...shadows.lg,
              },
            ]}
          >
            {appliedCount !== null ? (
              <View style={styles.successBox}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>✨</Text>
                <Text
                  style={[
                    { color: colors.text, fontSize: typography.xl, fontFamily: fonts.headingBold },
                  ]}
                >
                  Routine Active!
                </Text>
                <Text
                  style={[
                    {
                      color: colors.textSecondary,
                      fontSize: typography.sm,
                      fontFamily: fonts.body,
                      textAlign: 'center',
                      marginTop: 6,
                    },
                  ]}
                >
                  Scheduled {appliedCount} care nudges for {selectedPerson?.firstName}.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      { color: colors.text, fontSize: typography.lg, fontFamily: fonts.headingBold },
                    ]}
                  >
                    Schedule Routine
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                    <Text style={[{ color: colors.textTertiary, fontSize: 18, fontFamily: fonts.bodyBold }]}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    {
                      color: colors.textSecondary,
                      fontSize: typography.xs,
                      fontFamily: fonts.body,
                      marginTop: 4,
                      marginBottom: spacing.md,
                    },
                  ]}
                >
                  Who would you like to assign the "{selectedTemplate?.title}" routine to?
                </Text>

                <Text
                  style={[
                    styles.chooseLabel,
                    { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodySemibold, marginBottom: 8 },
                  ]}
                >
                  SELECT LOVED ONE
                </Text>

                <View style={{ gap: 8, marginBottom: spacing.lg }}>
                  {people.map((p) => {
                    const isSelected = p.id === targetPersonId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setTargetPersonId(p.id)}
                        style={[
                          styles.personOption,
                          {
                            backgroundColor: isSelected ? colors.surfaceWarm : colors.surfaceSubtle,
                            borderColor: isSelected ? colors.accent : colors.border,
                            borderRadius: radius.xl,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            { backgroundColor: p.avatarColor, borderRadius: radius.full },
                          ]}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                            {p.firstName[0]}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              { color: colors.text, fontSize: typography.sm, fontFamily: fonts.bodySemibold },
                            ]}
                          >
                            {p.firstName}
                          </Text>
                          <Text
                            style={[
                              { color: colors.textTertiary, fontSize: 10, fontFamily: fonts.body },
                            ]}
                          >
                            {p.relationship ? p.relationship.toUpperCase() : 'CONTACT'}
                          </Text>
                        </View>
                        {isSelected && (
                          <View
                            style={[
                              styles.checkCircle,
                              { backgroundColor: colors.accent, borderRadius: radius.full },
                            ]}
                          >
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={handleApply}
                  activeOpacity={0.8}
                  style={[
                    styles.confirmBtn,
                    {
                      backgroundColor: colors.accent,
                      borderRadius: radius.full,
                      ...shadows.accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { color: '#fff', fontSize: typography.md, fontFamily: fonts.bodyBold },
                    ]}
                  >
                    Schedule All ({selectedTemplate?.items.length} Habits)
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  filterScroll: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  templateCard: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emojiBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateTitle: {},
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  description: {},
  itemsBox: {},
  itemsTitle: {
    letterSpacing: 0.6,
  },
  nudgeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chooseLabel: {
    letterSpacing: 0.5,
  },
  personOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
});

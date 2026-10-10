import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { User, RelationshipType } from '../types';
import { generateId } from '../utils/formatters';

const RELATIONSHIPS: { value: RelationshipType; label: string; emoji: string }[] = [
  { value: 'partner', label: 'Partner', emoji: '❤️' },
  { value: 'parent', label: 'Parent', emoji: '👨' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'child', label: 'Child', emoji: '👶' },
  { value: 'friend', label: 'Friend', emoji: '🤝' },
];

const AVATAR_COLORS = [
  '#C2796B', '#7BAE8E', '#9B8EC4', '#D4A85C',
  '#7A9CC6', '#B89575', '#8E7DB8', '#6B9E7E',
];

export function AddPersonScreen({ navigation }: any) {
  const { addPerson } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('family');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = name.trim().length >= 1;

  const handleAdd = async () => {
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const newPerson: User = {
      id: generateId(),
      name: name.trim(),
      firstName: name.trim(),
      avatarColor: selectedColor,
      relationship,
      accountabilityLevel: 'trust',
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
    };

    addPerson(newPerson);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      navigation.goBack();
    }, 1400);
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 56 }}>🌿</Text>
        <Text style={[styles.successTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold, marginTop: 24 }]}>
          {name} added!
        </Text>
        <Text style={[{ color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, marginTop: 10 }]}>
          You can now create nudges for them.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={[styles.navHeader, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[{ color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text, fontSize: typography.md, fontFamily: fonts.heading }]}>
          Add Person
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.lg }]}>
        {/* Avatar preview */}
        <View style={styles.avatarPreview}>
          <View
            style={[
              styles.avatarLarge,
              { backgroundColor: selectedColor + '18', borderRadius: radius.full },
            ]}
          >
            <Text style={[styles.avatarLargeText, { color: selectedColor, fontFamily: fonts.headingBold }]}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: c,
                    borderRadius: radius.full,
                    borderWidth: selectedColor === c ? 3 : 0,
                    borderColor: colors.text,
                    transform: [{ scale: selectedColor === c ? 1.15 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Name */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
          NAME
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sarah, Dad, Aarav"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: name.length > 0 ? colors.accent : colors.border,
              borderRadius: radius.xl,
              color: colors.text,
              fontSize: typography.lg,
              fontFamily: fonts.body,
            },
          ]}
        />

        {/* Relationship */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold, marginTop: 24 }]}>
          RELATIONSHIP
        </Text>
        <View style={styles.relGrid}>
          {RELATIONSHIPS.map((r) => {
            const isSelected = relationship === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRelationship(r.value)}
                style={[
                  styles.relChip,
                  {
                    backgroundColor: isSelected ? colors.accentLight : colors.surface,
                    borderRadius: radius.xl,
                    ...shadows.sm,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
                <Text style={[{ color: isSelected ? colors.accent : colors.text, fontSize: typography.sm, fontFamily: isSelected ? fonts.bodySemibold : fonts.body }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={[styles.bottomBar, { paddingHorizontal: spacing.lg, backgroundColor: colors.bg }]}>
        <TouchableOpacity
          onPress={handleAdd}
          disabled={!canSubmit || loading}
          activeOpacity={0.82}
          style={[
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.accent : colors.border,
              borderRadius: radius.full,
              ...(canSubmit ? shadows.accent : {}),
            },
          ]}
        >
          <Text style={[{ color: '#fff', fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>
            {loading ? 'Adding…' : 'Add to circle →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successTitle: { textAlign: 'center' },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navTitle: {},
  content: {
    paddingTop: 28,
    paddingBottom: 40,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarLarge: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarLargeText: {
    fontSize: 38,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorDot: {
    width: 30,
    height: 30,
  },
  fieldLabel: {
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  relGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bottomBar: {
    paddingVertical: 18,
  },
  submitBtn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

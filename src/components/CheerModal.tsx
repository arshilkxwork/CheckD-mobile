import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { User } from '../types';

interface CheerModalProps {
  visible: boolean;
  onClose: () => void;
  people: User[];
  defaultPersonId?: string;
  onSendCheer: (personId: string, emoji: string, message: string) => void;
}

const PRESET_CHEERS = [
  { emoji: '🎉', title: 'Super proud of you!', message: 'Amazing consistency with your care routine!' },
  { emoji: '💪', title: 'Keep shining!', message: "You've got this. Every single day counts!" },
  { emoji: '❤️', title: 'Sending warmth', message: 'Thinking of you and cheering you on with love.' },
  { emoji: '☕', title: 'Tea on me!', message: 'Take a soothing pause today — you earned it!' },
  { emoji: '🌟', title: 'True inspiration', message: 'You inspire our entire care circle every single day!' },
  { emoji: '🌿', title: 'Peace & calm', message: 'Take a deep breath — you are doing wonderful.' },
];

export function CheerModal({
  visible,
  onClose,
  people,
  defaultPersonId,
  onSendCheer,
}: CheerModalProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, spacing, shadows } = theme;

  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    defaultPersonId || (people[0]?.id ?? '')
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || people[0];

  const handleSend = () => {
    if (!selectedPerson) return;
    const preset = PRESET_CHEERS[selectedIdx];
    const message = customNote.trim() ? customNote.trim() : preset.message;
    onSendCheer(selectedPerson.id, preset.emoji, message);

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setCustomNote('');
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(45, 49, 57, 0.45)' }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xxxl,
              ...shadows.lg,
            },
          ]}
        >
          {sentSuccess ? (
            <View style={styles.successBox}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
              <Text
                style={[
                  styles.successTitle,
                  { color: colors.text, fontSize: typography.xl, fontFamily: fonts.headingBold },
                ]}
              >
                Cheer Sent!
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
                {selectedPerson?.firstName} will feel the love and appreciation ❤️
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.xl }}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>💌</Text>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.text, fontSize: typography.xl, fontFamily: fonts.headingBold },
                    ]}
                  >
                    Send a Cheer
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[{ color: colors.textTertiary, fontSize: 18, fontFamily: fonts.bodyBold }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: fonts.body,
                    marginTop: 4,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                Celebrate their consistency and brighten their day with words of affirmation.
              </Text>

              {/* Recipient Picker */}
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: fonts.bodySemibold,
                    marginBottom: 8,
                  },
                ]}
              >
                CHEERING FOR
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                <View style={styles.personRow}>
                  {people.map((p) => {
                    const isSelected = p.id === (selectedPersonId || selectedPerson?.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setSelectedPersonId(p.id)}
                        style={[
                          styles.personChip,
                          {
                            backgroundColor: isSelected ? colors.accentLight : colors.surfaceSubtle,
                            borderColor: isSelected ? colors.accent : colors.border,
                            borderRadius: radius.full,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.avatarDot,
                            { backgroundColor: p.avatarColor, borderRadius: radius.full },
                          ]}
                        />
                        <Text
                          style={[
                            {
                              color: isSelected ? colors.accentDark : colors.text,
                              fontSize: typography.xs,
                              fontFamily: isSelected ? fonts.bodyBold : fonts.bodyMedium,
                            },
                          ]}
                        >
                          {p.firstName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Preset Cards */}
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: fonts.bodySemibold,
                    marginBottom: 8,
                  },
                ]}
              >
                CHOOSE AN AFFIRMATION
              </Text>
              <View style={styles.presetsGrid}>
                {PRESET_CHEERS.map((preset, idx) => {
                  const isSelected = idx === selectedIdx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedIdx(idx)}
                      style={[
                        styles.presetCard,
                        {
                          backgroundColor: isSelected ? colors.surfaceWarm : colors.surfaceSubtle,
                          borderColor: isSelected ? colors.accent : colors.border,
                          borderRadius: radius.lg,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 22, marginRight: 10 }}>{preset.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            {
                              color: colors.text,
                              fontSize: typography.xs,
                              fontFamily: fonts.bodySemibold,
                            },
                          ]}
                        >
                          {preset.title}
                        </Text>
                        <Text
                          style={[
                            {
                              color: colors.textSecondary,
                              fontSize: 10,
                              fontFamily: fonts.body,
                              marginTop: 2,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {preset.message}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom message input */}
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontFamily: fonts.bodySemibold,
                    marginTop: spacing.md,
                    marginBottom: 6,
                  },
                ]}
              >
                PERSONAL NOTE (OPTIONAL)
              </Text>
              <TextInput
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="Add a loving personal touch..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={2}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    color: colors.text,
                    fontSize: typography.sm,
                    fontFamily: fonts.body,
                    padding: spacing.md,
                  },
                ]}
              />

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.8}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: radius.full,
                    marginTop: spacing.lg,
                    ...shadows.accent,
                  },
                ]}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>{PRESET_CHEERS[selectedIdx].emoji}</Text>
                <Text
                  style={[
                    {
                      color: '#fff',
                      fontSize: typography.md,
                      fontFamily: fonts.bodyBold,
                    },
                  ]}
                >
                  Send to {selectedPerson?.firstName || 'Friend'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {},
  subtitle: {
    lineHeight: 18,
  },
  sectionLabel: {
    letterSpacing: 0.5,
  },
  personRow: {
    flexDirection: 'row',
    gap: 8,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  avatarDot: {
    width: 10,
    height: 10,
  },
  presetsGrid: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  successBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {},
});

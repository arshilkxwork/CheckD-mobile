import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import {
  Medication,
  MedicationForm,
  MedicationFrequency,
  User,
} from '../types';
import { Avatar } from './Avatar';
import { getFormEmoji } from '../utils/medications';
import { generateId } from '../utils/formatters';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (med: Medication, autoCreateNudges: boolean) => void;
  people: User[];
  currentUser: User;
  initialPersonId?: string;
}

const FORM_OPTIONS: { form: MedicationForm; label: string }[] = [
  { form: 'tablet', label: 'Tablet' },
  { form: 'capsule', label: 'Capsule' },
  { form: 'liquid', label: 'Liquid' },
  { form: 'drops', label: 'Drops' },
  { form: 'inhaler', label: 'Inhaler' },
  { form: 'spray', label: 'Spray' },
];

const COLOR_OPTIONS = ['#FF784B', '#4A90E2', '#F5A623', '#6B9E7E', '#C2796B', '#8E44AD'];

const FREQ_OPTIONS: { freq: MedicationFrequency; label: string; defaultTimes: string[] }[] = [
  { freq: 'once_daily', label: 'Once daily', defaultTimes: ['08:00'] },
  { freq: 'twice_daily', label: 'Twice daily', defaultTimes: ['08:00', '20:00'] },
  { freq: 'thrice_daily', label: '3× daily', defaultTimes: ['08:00', '13:00', '20:00'] },
  { freq: 'as_needed', label: 'As needed', defaultTimes: [] },
];

export function AddMedicationModal({
  visible,
  onClose,
  onSave,
  people,
  currentUser,
  initialPersonId,
}: AddMedicationModalProps) {
  const { theme } = useTheme();
  const { colors, typography, fonts, radius, shadows, spacing } = theme;

  const allPersons = [currentUser, ...people.filter((p) => p.id !== currentUser.id)];
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    initialPersonId || (people[0]?.id ?? currentUser.id)
  );

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<MedicationFrequency>('once_daily');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [currentSupply, setCurrentSupply] = useState('30');
  const [totalCapacity, setTotalCapacity] = useState('30');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState('7');
  const [unit, setUnit] = useState('pills');
  const [instructions, setInstructions] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [autoCreateNudges, setAutoCreateNudges] = useState(true);
  const [error, setError] = useState('');

  const handleSelectFrequency = (freq: MedicationFrequency, defTimes: string[]) => {
    setFrequency(freq);
    setTimes(defTimes);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a medication name');
      return;
    }
    if (!dosage.trim()) {
      setError('Please specify the dosage (e.g. 5 mg)');
      return;
    }

    const supplyNum = parseInt(currentSupply, 10) || 30;
    const capacityNum = parseInt(totalCapacity, 10) || supplyNum;
    const thresholdNum = parseInt(lowSupplyThreshold, 10) || 7;

    const newMed: Medication = {
      id: generateId(),
      personId: selectedPersonId,
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      color,
      instructions: instructions.trim(),
      frequency,
      times,
      currentSupply: supplyNum,
      totalCapacity: capacityNum,
      lowSupplyThreshold: thresholdNum,
      unit: unit.trim() || 'pills',
      prescribingDoctor: prescribingDoctor.trim() || undefined,
      pharmacy: pharmacy.trim() || undefined,
      isActive: true,
      adherenceRate: 100,
      createdAt: new Date().toISOString(),
    };

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    onSave(newMed, autoCreateNudges);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setInstructions('');
    setPrescribingDoctor('');
    setPharmacy('');
    setError('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              ...shadows.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
            <View>
              <Text style={[{ color: colors.text, fontSize: typography.lg, fontFamily: fonts.headingBold }]}>
                Add to Care Cabinet
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.body }]}>
                Track prescription doses, instructions & pill inventory
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 22, color: colors.textTertiary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg, paddingBottom: 40 }]}
          >
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FDE8E8', borderRadius: radius.md }]}>
                <Text style={{ color: '#E64949', fontSize: typography.xs, fontFamily: fonts.bodyMedium }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Person selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
              WHO IS THIS FOR?
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personList}>
              {allPersons.map((p) => {
                const isSelected = p.id === selectedPersonId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPersonId(p.id)}
                    style={[
                      styles.personChip,
                      {
                        backgroundColor: isSelected ? `${colors.accent}15` : colors.surfaceWarm,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Avatar user={p} size={26} />
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
            </ScrollView>

            {/* Med Name & Dosage */}
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  MEDICATION NAME *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    setError('');
                  }}
                  placeholder="e.g. Amlodipine"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  DOSAGE *
                </Text>
                <TextInput
                  value={dosage}
                  onChangeText={(t) => {
                    setDosage(t);
                    setError('');
                  }}
                  placeholder="e.g. 5 mg"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Form Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold, marginTop: 14 }]}>
              FORM
            </Text>
            <View style={styles.wrapGrid}>
              {FORM_OPTIONS.map((opt) => {
                const isSelected = form === opt.form;
                return (
                  <TouchableOpacity
                    key={opt.form}
                    onPress={() => setForm(opt.form)}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected ? `${colors.accent}15` : colors.surfaceWarm,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: radius.xl,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{getFormEmoji(opt.form)}</Text>
                    <Text
                      style={[
                        {
                          color: isSelected ? colors.accentDark : colors.text,
                          fontSize: typography.xs,
                          fontFamily: isSelected ? fonts.bodyBold : fonts.body,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color Palette */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold, marginTop: 14 }]}>
              PILL COLOR THEME
            </Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c,
                      borderWidth: color === c ? 3 : 0,
                      borderColor: '#FFFFFF',
                      borderRadius: radius.full,
                      ...shadows.sm,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Frequency */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold, marginTop: 14 }]}>
              SCHEDULE & FREQUENCY
            </Text>
            <View style={styles.wrapGrid}>
              {FREQ_OPTIONS.map((opt) => {
                const isSelected = frequency === opt.freq;
                return (
                  <TouchableOpacity
                    key={opt.freq}
                    onPress={() => handleSelectFrequency(opt.freq, opt.defaultTimes)}
                    style={[
                      styles.freqOption,
                      {
                        backgroundColor: isSelected ? `${colors.accent}15` : colors.surfaceWarm,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        {
                          color: isSelected ? colors.accentDark : colors.text,
                          fontSize: typography.xs,
                          fontFamily: isSelected ? fonts.bodyBold : fonts.body,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Inventory Tracker Inputs */}
            <View style={[styles.row, { marginTop: 14 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  SUPPLY COUNT
                </Text>
                <TextInput
                  value={currentSupply}
                  onChangeText={(v) => {
                    setCurrentSupply(v);
                    setTotalCapacity(v);
                  }}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  REFILL ALERT AT
                </Text>
                <TextInput
                  value={lowSupplyThreshold}
                  onChangeText={setLowSupplyThreshold}
                  keyboardType="numeric"
                  placeholder="7"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  UNIT
                </Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="pills"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Instructions */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold, marginTop: 14 }]}>
              INSTRUCTIONS & FOOD NOTES
            </Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. Take with morning tea and full glass of water"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceWarm,
                  color: colors.text,
                  borderRadius: radius.lg,
                  borderColor: colors.border,
                  fontFamily: fonts.body,
                },
              ]}
            />

            {/* Prescribing Doctor & Pharmacy */}
            <View style={[styles.row, { marginTop: 14 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  DOCTOR (OPTIONAL)
                </Text>
                <TextInput
                  value={prescribingDoctor}
                  onChangeText={setPrescribingDoctor}
                  placeholder="e.g. Dr. Mehta"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  PHARMACY (OPTIONAL)
                </Text>
                <TextInput
                  value={pharmacy}
                  onChangeText={setPharmacy}
                  placeholder="e.g. Apollo Rx"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceWarm,
                      color: colors.text,
                      borderRadius: radius.lg,
                      borderColor: colors.border,
                      fontFamily: fonts.body,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Auto Create Nudges Toggle */}
            <View
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.surfaceWarm,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  marginTop: 18,
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[{ color: colors.text, fontSize: typography.xs, fontFamily: fonts.bodyBold }]}>
                  Auto-create Daily Care Nudges
                </Text>
                <Text style={[{ color: colors.textSecondary, fontSize: 11, fontFamily: fonts.body, marginTop: 2 }]}>
                  Generates daily recurring check-ins for this schedule
                </Text>
              </View>
              <Switch
                value={autoCreateNudges}
                onValueChange={setAutoCreateNudges}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>

            {/* Action Buttons */}
            <View style={[styles.submitRow, { marginTop: 22 }]}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: radius.xl }]}
              >
                <Text style={[{ color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodyMedium }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: colors.accent, borderRadius: radius.xl, ...shadows.accent }]}
              >
                <Text style={[{ color: '#FFFFFF', fontSize: typography.sm, fontFamily: fonts.bodyBold }]}>
                  Save to Cabinet
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  scrollContent: {
    paddingTop: 16,
  },
  errorBox: {
    padding: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  personList: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  wrapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 28,
    height: 28,
  },
  freqOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
import { CATEGORY_CONFIG, RELATIONSHIP_CONFIG } from '../theme/tokens';
import { User, Nudge, NudgeCategory, RepeatInterval, ReminderInterval } from '../types';
import { generateId } from '../utils/formatters';

type Step = 'who' | 'what' | 'when' | 'settings' | 'review';

const STEPS: Step[] = ['who', 'what', 'when', 'settings', 'review'];

const REPEAT_OPTIONS: { value: RepeatInterval; label: string }[] = [
  { value: 'once', label: 'Just once' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
];

const REMINDER_OPTIONS: { value: ReminderInterval; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

export function CreateNudgeScreen({ navigation }: any) {
  const { people, currentUser, addNudge } = useApp();
  const { theme } = useTheme();
  const { colors, spacing, typography, fonts, radius, shadows } = theme;

  const [step, setStep] = useState<Step>('who');
  const [selectedPerson, setSelectedPerson] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NudgeCategory>('medicine');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedHour, setSelectedHour] = useState('9');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');
  const [repeat, setRepeat] = useState<RepeatInterval>('daily');
  const [reminderInterval, setReminderInterval] = useState<ReminderInterval>(15);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1]);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = () => {
    if (step === 'who') return selectedPerson !== null;
    if (step === 'what') {
      return selectedCategory !== 'custom' || customTitle.trim().length > 0;
    }
    return true;
  };

  const buildTitle = () => {
    if (selectedCategory === 'custom') return customTitle.trim() || 'Custom nudge';
    return CATEGORY_CONFIG[selectedCategory]?.label ?? 'Nudge';
  };

  const buildEmoji = () => CATEGORY_CONFIG[selectedCategory]?.emoji ?? '📌';

  const buildScheduledTime = () => {
    const now = new Date();
    let h = parseInt(selectedHour, 10);
    const m = parseInt(selectedMinute, 10);
    if (selectedPeriod === 'PM' && h !== 12) h += 12;
    if (selectedPeriod === 'AM' && h === 12) h = 0;
    now.setHours(h, m, 0, 0);
    return now.toISOString();
  };

  const handleSend = async () => {
    if (!selectedPerson) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const newNudge: Nudge = {
      id: generateId(),
      creatorId: currentUser.id,
      receiverId: selectedPerson.id,
      category: selectedCategory,
      emoji: buildEmoji(),
      title: buildTitle(),
      scheduledTime: buildScheduledTime(),
      repeat,
      reminderInterval,
      stopWhen: 'completed',
      status: 'pending',
      proofType: 'tap',
      accountabilityLevel: selectedPerson.accountabilityLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addNudge(newNudge);
    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      navigation.navigate('Home');
    }, 2200);
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.bg }]}>
        <Text style={styles.successEmoji}>🌿</Text>
        <Text style={[styles.successTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
          Nudge sent!
        </Text>
        <Text style={[styles.successSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
          {selectedPerson?.firstName} will be notified.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.navHeader, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            {stepIndex === 0 ? 'Cancel' : '← Back'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text, fontSize: typography.md, fontFamily: fonts.heading }]}>
          New Nudge
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                backgroundColor: i <= stepIndex ? colors.accent : colors.border,
                width: i === stepIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingHorizontal: spacing.lg }]}>
        {step === 'who' && (
          <StepWho
            people={people}
            selected={selectedPerson}
            onSelect={setSelectedPerson}
            colors={colors}
            typography={typography}
            fonts={fonts}
            radius={radius}
            shadows={shadows}
            spacing={spacing}
          />
        )}
        {step === 'what' && (
          <StepWhat
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            customTitle={customTitle}
            onCustomTitle={setCustomTitle}
            colors={colors}
            typography={typography}
            fonts={fonts}
            radius={radius}
            shadows={shadows}
            spacing={spacing}
          />
        )}
        {step === 'when' && (
          <StepWhen
            hour={selectedHour}
            minute={selectedMinute}
            period={selectedPeriod}
            setHour={setSelectedHour}
            setMinute={setSelectedMinute}
            setPeriod={setSelectedPeriod}
            colors={colors}
            typography={typography}
            fonts={fonts}
            radius={radius}
            spacing={spacing}
          />
        )}
        {step === 'settings' && (
          <StepSettings
            repeat={repeat}
            setRepeat={setRepeat}
            reminderInterval={reminderInterval}
            setReminderInterval={setReminderInterval}
            colors={colors}
            typography={typography}
            fonts={fonts}
            radius={radius}
            spacing={spacing}
          />
        )}
        {step === 'review' && selectedPerson && (
          <StepReview
            person={selectedPerson}
            category={selectedCategory}
            title={buildTitle()}
            emoji={buildEmoji()}
            hour={selectedHour}
            minute={selectedMinute}
            period={selectedPeriod}
            repeat={repeat}
            reminderInterval={reminderInterval}
            colors={colors}
            typography={typography}
            fonts={fonts}
            radius={radius}
            shadows={shadows}
            spacing={spacing}
          />
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomBar, { paddingHorizontal: spacing.lg, backgroundColor: colors.bg }]}>
        <TouchableOpacity
          onPress={step === 'review' ? handleSend : goNext}
          disabled={!canProceed() || loading}
          activeOpacity={0.82}
          style={[
            styles.nextBtn,
            {
              backgroundColor: canProceed() ? colors.accent : colors.border,
              borderRadius: radius.full,
              opacity: loading ? 0.7 : 1,
              ...( canProceed() ? shadows.accent : {}),
            },
          ]}
        >
          <Text style={[styles.nextBtnText, { color: '#fff', fontSize: typography.lg, fontFamily: fonts.bodySemibold }]}>
            {loading ? 'Sending…' : step === 'review' ? 'Send Nudge →' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Step: Who ──────────────────────────────────────────────────────────────────
function StepWho({ people, selected, onSelect, colors, typography, fonts, radius, shadows }: any) {
  return (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
        Who is this for?
      </Text>
      <Text style={[styles.stepSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, lineHeight: typography.md * typography.lineHeightRelaxed }]}>
        Choose someone from your circle.
      </Text>
      {people.map((p: User) => {
        const isSelected = selected?.id === p.id;
        const rel = p.relationship ? RELATIONSHIP_CONFIG[p.relationship] : null;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => onSelect(p)}
            activeOpacity={0.82}
            style={[
              styles.personOption,
              {
                backgroundColor: isSelected ? colors.accentLight : colors.surface,
                borderRadius: radius.xxl,
                ...shadows.sm,
              },
            ]}
          >
            <View
              style={[
                styles.personAvatar,
                { backgroundColor: p.avatarColor + '18', borderRadius: radius.full },
              ]}
            >
              <Text style={[styles.personAvatarText, { color: p.avatarColor, fontFamily: fonts.heading }]}>{p.firstName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.personOptionName, { color: colors.text, fontSize: typography.lg, fontFamily: fonts.heading }]}>
                {p.firstName}
              </Text>
              {rel && (
                <Text style={[styles.personOptionRel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>
                  {rel.emoji} {rel.label}
                </Text>
              )}
            </View>
            {isSelected && <Text style={{ color: colors.accent, fontSize: 20 }}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Step: What ──────────────────────────────────────────────────────────────────
function StepWhat({ selected, onSelect, customTitle, onCustomTitle, colors, typography, fonts, radius, shadows }: any) {
  const categories = Object.entries(CATEGORY_CONFIG) as [NudgeCategory, any][];

  return (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
        What's the nudge?
      </Text>
      <Text style={[styles.stepSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body, lineHeight: typography.md * typography.lineHeightRelaxed }]}>
        Pick a category or create a custom one.
      </Text>
      <View style={styles.categoryGrid}>
        {categories.map(([key, cat]) => {
          const isSelected = selected === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelect(key)}
              activeOpacity={0.82}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.accentLight : colors.surface,
                  borderRadius: radius.xl,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, { color: isSelected ? colors.accent : colors.text, fontSize: typography.sm, fontFamily: isSelected ? fonts.bodySemibold : fonts.body }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected === 'custom' && (
        <TextInput
          value={customTitle}
          onChangeText={onCustomTitle}
          placeholder="e.g. Take a deep breath"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.customInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              color: colors.text,
              fontSize: typography.md,
              fontFamily: fonts.body,
            },
          ]}
        />
      )}
    </View>
  );
}

// ── Step: When ──────────────────────────────────────────────────────────────────
function StepWhen({ hour, minute, period, setHour, setMinute, setPeriod, colors, typography, fonts, radius }: any) {
  return (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
        When should it happen?
      </Text>
      <Text style={[styles.stepSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
        Pick the time.
      </Text>
      <View
        style={[
          styles.timeCard,
          {
            backgroundColor: colors.surfaceWarm,
            borderRadius: radius.xxl,
          },
        ]}
      >
        <Text style={[styles.timeDisplay, { color: colors.text, fontSize: 52, fontFamily: fonts.headingBold }]}>
          {hour}:{minute} {period}
        </Text>
      </View>
      <View style={styles.timePickerRow}>
        <View style={styles.timeCol}>
          <Text style={[styles.timePickerLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>Hour</Text>
          {HOURS.map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => setHour(h)}
              style={[
                styles.timeOption,
                {
                  backgroundColor: hour === h ? colors.accentLight : 'transparent',
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Text style={[styles.timeOptionText, { color: hour === h ? colors.accent : colors.text, fontFamily: hour === h ? fonts.bodySemibold : fonts.body, fontSize: typography.md }]}>
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.timeCol}>
          <Text style={[styles.timePickerLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>Min</Text>
          {MINUTES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMinute(m)}
              style={[
                styles.timeOption,
                {
                  backgroundColor: minute === m ? colors.accentLight : 'transparent',
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Text style={[styles.timeOptionText, { color: minute === m ? colors.accent : colors.text, fontFamily: minute === m ? fonts.bodySemibold : fonts.body, fontSize: typography.md }]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.timeCol}>
          <Text style={[styles.timePickerLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>AM/PM</Text>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.timeOption,
                {
                  backgroundColor: period === p ? colors.accentLight : 'transparent',
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Text style={[styles.timeOptionText, { color: period === p ? colors.accent : colors.text, fontFamily: period === p ? fonts.bodySemibold : fonts.body, fontSize: typography.md }]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Step: Settings ──────────────────────────────────────────────────────────────
function StepSettings({ repeat, setRepeat, reminderInterval, setReminderInterval, colors, typography, fonts, radius }: any) {
  return (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
        How often?
      </Text>
      <Text style={[styles.stepSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
        Repeat and reminder settings.
      </Text>

      <Text style={[styles.settingLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold }]}>
        REPEAT
      </Text>
      {REPEAT_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => setRepeat(opt.value)}
          style={[
            styles.settingRow,
            {
              backgroundColor: repeat === opt.value ? colors.accentLight : colors.surface,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Text style={[styles.settingRowText, { color: colors.text, fontSize: typography.md, fontFamily: repeat === opt.value ? fonts.bodySemibold : fonts.body }]}>
            {opt.label}
          </Text>
          {repeat === opt.value && <Text style={{ color: colors.accent, fontFamily: fonts.bodySemibold }}>✓</Text>}
        </TouchableOpacity>
      ))}

      <Text style={[styles.settingLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.bodySemibold, marginTop: 24 }]}>
        REMIND EVERY
      </Text>
      <View style={styles.reminderGrid}>
        {REMINDER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => setReminderInterval(opt.value)}
            style={[
              styles.reminderChip,
              {
                backgroundColor: reminderInterval === opt.value ? colors.accent : colors.surface,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text style={[styles.reminderChipText, { color: reminderInterval === opt.value ? '#fff' : colors.text, fontSize: typography.sm, fontFamily: fonts.bodyMedium }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Step: Review ──────────────────────────────────────────────────────────────────
function StepReview({ person, title, emoji, hour, minute, period, repeat, reminderInterval, colors, typography, fonts, radius, shadows }: any) {
  const rel = person.relationship ? RELATIONSHIP_CONFIG[person.relationship] : null;
  return (
    <View>
      <Text style={[styles.stepTitle, { color: colors.text, fontSize: typography.xxl, fontFamily: fonts.headingBold }]}>
        Looks good? 👀
      </Text>
      <Text style={[styles.stepSub, { color: colors.textSecondary, fontSize: typography.md, fontFamily: fonts.body }]}>
        Here's what you're sending.
      </Text>
      <View
        style={[
          styles.reviewCard,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.xxl,
            ...shadows.md,
          },
        ]}
      >
        {/* Person */}
        <View style={[styles.reviewRow, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>To</Text>
          <View style={styles.reviewPersonRow}>
            <View style={[styles.miniAvatar, { backgroundColor: person.avatarColor + '18', borderRadius: radius.full }]}>
              <Text style={[styles.miniAvatarText, { color: person.avatarColor, fontFamily: fonts.heading }]}>{person.firstName.charAt(0)}</Text>
            </View>
            <Text style={[styles.reviewValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodySemibold }]}>
              {person.firstName}
            </Text>
            {rel && <Text style={[{ color: colors.textSecondary, fontSize: typography.sm }]}> {rel.emoji}</Text>}
          </View>
        </View>
        {/* What */}
        <View style={[styles.reviewRow, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>What</Text>
          <Text style={[styles.reviewValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            {emoji} {title}
          </Text>
        </View>
        {/* When */}
        <View style={[styles.reviewRow, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>When</Text>
          <Text style={[styles.reviewValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            {hour}:{minute} {period}
          </Text>
        </View>
        {/* Repeat */}
        <View style={[styles.reviewRow, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>Repeat</Text>
          <Text style={[styles.reviewValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            {REPEAT_OPTIONS.find((o) => o.value === repeat)?.label}
          </Text>
        </View>
        {/* Reminder */}
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: typography.sm, fontFamily: fonts.body }]}>Reminder</Text>
          <Text style={[styles.reviewValue, { color: colors.text, fontSize: typography.md, fontFamily: fonts.bodyMedium }]}>
            Every {reminderInterval} min
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successEmoji: { fontSize: 64, marginBottom: 24 },
  successTitle: { marginBottom: 10 },
  successSub: { textAlign: 'center' },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 60 },
  backText: {},
  navTitle: {},
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingTop: 28,
    paddingBottom: 48,
  },
  stepTitle: {
    marginBottom: 10,
  },
  stepSub: {
    marginBottom: 28,
  },
  personOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    marginBottom: 12,
  },
  personAvatar: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: 20,
  },
  personOptionName: {},
  personOptionRel: {},
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryChip: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  catLabel: { textAlign: 'center' },
  customInput: {
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 4,
  },
  timeCard: {
    alignItems: 'center',
    paddingVertical: 36,
    marginBottom: 28,
  },
  timeDisplay: {
    letterSpacing: -2,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  timeCol: {
    alignItems: 'center',
    flex: 1,
  },
  timePickerLabel: {
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 4,
    width: '100%',
    alignItems: 'center',
  },
  timeOptionText: {},
  settingLabel: {
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 8,
  },
  settingRowText: {},
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reminderChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reminderChipText: {},
  reviewCard: {
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  reviewLabel: {
    width: 80,
  },
  reviewPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  miniAvatar: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 12,
  },
  reviewValue: {
    flex: 1,
    textAlign: 'right',
  },
  bottomBar: {
    paddingVertical: 18,
  },
  nextBtn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  nextBtnText: {},
});

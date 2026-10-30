import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Constants from 'expo-constants';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Chip, Glass, IconWell, Segmented, Tap, Txt, haptic } from '../ui/primitives';
import { Avatar, Mark } from '../ui/pieces';
import { Nudge, NudgeCategory, RepeatInterval, ReminderInterval, User } from '../types';
import { generateId } from '../utils/formatters';
import { nextTimeOfDay } from '../services/reminders';

const APP_NAME = Constants.expoConfig?.name ?? 'Pingkin';

const CATEGORIES: NudgeCategory[] = ['medicine', 'water', 'exercise', 'checkin', 'homework', 'custom'];
const SUGGESTED: Record<NudgeCategory, string> = {
  medicine: 'Take your medicine',
  water: 'Drink a glass of water',
  exercise: 'Go for a short walk',
  checkin: 'Let me know you’re okay',
  homework: 'Finish your homework',
  custom: '',
};
const REPEATS: { value: RepeatInterval; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
];
const INTERVALS: { value: ReminderInterval; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
];
const PRESETS = [
  { label: 'Morning', h: 8, m: 0 },
  { label: 'Midday', h: 13, m: 0 },
  { label: 'Evening', h: 19, m: 0 },
  { label: 'Night', h: 21, m: 0 },
];

function label12(h: number, m: number) {
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function CreateNudgeScreen({ navigation, route }: any) {
  const { people, currentUser, addNudge, medications } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();

  const everyone: User[] = [currentUser, ...people];
  const [picked, setWho] = useState<User | null>(null);
  // With just one person in the circle (usually your partner), start with them.
  const who = picked ?? (people.length === 1 ? people[0] : null);
  const [needWho, setNeedWho] = useState(false);
  const scrollRef = useRef<any>(null);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const [category, setCategory] = useState<NudgeCategory>('medicine');
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);
  const [repeat, setRepeat] = useState<RepeatInterval>('daily');
  const [interval, setIntervalMin] = useState<ReminderInterval>(15);
  const [sent, setSent] = useState(false);

  // Arriving from a person's profile preselects them.
  const presetId: string | undefined = route?.params?.personId;
  const [appliedPreset, setAppliedPreset] = useState<string | undefined>();
  if (presetId && presetId !== appliedPreset) {
    setAppliedPreset(presetId);
    const p = everyone.find((x) => x.id === presetId);
    if (p) setWho(p);
  }
  if (!presetId && appliedPreset) setAppliedPreset(undefined);
  useEffect(() => {
    // Clear the param so arriving again for the same person re-applies it.
    if (presetId) navigation.setParams({ personId: undefined });
  }, [presetId, navigation]);

  const isMe = who?.id === currentUser.id;
  const nudgeTime = (deltaMin: number) => {
    const t = (hour * 60 + minute + deltaMin + 1440) % 1440;
    setHour(Math.floor(t / 60));
    setMinute(t % 60);
  };
  const finalTitle = title.trim() || SUGGESTED[category];
  const ready = !!who && finalTitle.length > 0;
  const meds = who ? medications.filter((m) => m.isActive && m.personId === who.id) : [];

  const reset = () => {
    setWho(null);
    setCategory('medicine');
    setTitle('');
    setHour(21);
    setMinute(0);
    setRepeat('daily');
    setIntervalMin(15);
  };

  const close = () => {
    reset();
    navigation.navigate('HomeTab', { screen: 'Home' });
  };

  const send = () => {
    if (!who) {
      // Point at what's missing instead of sitting there disabled.
      setNeedWho(true);
      haptic.soft();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      if (!reduce) {
        shake.set(
          withSequence(
            withTiming(-8, { duration: 60 }),
            withTiming(8, { duration: 80 }),
            withTiming(-5, { duration: 70 }),
            withTiming(0, { duration: 60 }),
          ),
        );
      }
      return;
    }
    if (!ready) return;
    const now = new Date().toISOString();
    const nudge: Nudge = {
      id: generateId(),
      creatorId: currentUser.id,
      receiverId: who.id,
      category,
      emoji: CATEGORY_CONFIG[category].emoji,
      title: finalTitle,
      scheduledTime: nextTimeOfDay(hour, minute).toISOString(),
      repeat,
      reminderInterval: interval,
      stopWhen: 'completed',
      status: 'pending',
      proofType: 'tap',
      accountabilityLevel: who.accountabilityLevel,
      createdAt: now,
      updatedAt: now,
    };
    addNudge(nudge);
    haptic.success();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      close();
    }, 1500);
  };

  const label = (text: string) => (
    <Txt v="headline" style={{ marginTop: theme.space.xxl, marginBottom: theme.space.md }}>
      {text}
    </Txt>
  );

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="New nudge"
        large
        subtitle="A gentle reminder that keeps checking in until it’s done."
        onBack={close}
        backIcon="close"
        keyboard
        bottomInset={24}
        scrollRef={scrollRef}
        right={<Button label="Routines" size="sm" variant="glass" icon="leaf-outline" onPress={() => navigation.navigate('Routines')} />}
        footer={
          <View style={{ paddingHorizontal: theme.space.xl, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>
            <Button
              label={!who ? 'Send nudge' : isMe ? 'Set reminder' : `Send to ${who.firstName}`}
              icon="paper-plane-outline"
              size="lg"
              disabled={!!who && !ready}
              onPress={send}
            />
          </View>
        }
      >
        {/* Who */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: theme.space.md }}>
          <Txt v="headline">For</Txt>
          {needWho && !who ? (
            <Animated.View entering={reduce ? undefined : FadeInDown.duration(240)}>
              <Txt v="footnote" tone="warm" accessibilityLiveRegion="polite">
                Pick who this is for first
              </Txt>
            </Animated.View>
          ) : null}
        </View>
        <Animated.View style={shakeStyle}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {everyone.map((p) => {
              const active = who?.id === p.id;
              const me = p.id === currentUser.id;
              return (
                <Tap
                  key={p.id}
                  onPress={() => {
                    setWho(p);
                    setNeedWho(false);
                    haptic.tap();
                  }}
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityLabel={me ? 'Me' : p.firstName}
                  accessibilityState={{ selected: active }}
                  style={{ alignItems: 'center', width: 68 }}
                >
                  <View
                    style={{
                      padding: 3,
                      borderRadius: 40,
                      borderWidth: 2,
                      borderColor: active ? c.accent : 'transparent',
                    }}
                  >
                    <Avatar user={p} size={56} label={me ? 'Me' : undefined} />
                  </View>
                  <Txt v="footnote" tone={active ? 'accent' : 'secondary'} style={{ marginTop: 6, fontWeight: active ? '600' : '400' }} numberOfLines={1}>
                    {me ? 'Me' : p.firstName}
                  </Txt>
                </Tap>
              );
            })}
            <Tap
              onPress={() => navigation.navigate('PeopleTab', { screen: 'AddPerson' })}
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel="Add someone"
              style={{ alignItems: 'center', width: 68 }}
            >
              <View style={{ padding: 3 }}>
                <IconWell name="add" size={56} fg={c.accentText} bg={c.accentSoft} />
              </View>
              <Txt v="footnote" tone="secondary" style={{ marginTop: 6 }}>
                Add
              </Txt>
            </Tap>
          </ScrollView>
        </Animated.View>

        {who && !isMe ? (
          <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: c.accentSoft, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="paper-plane-outline" size={18} color={c.accent} />
            <Txt v="footnote" color={c.accentText} style={{ flex: 1, fontWeight: '500' }}>
              {who.phone || who.email
                ? `Will ping ${who.firstName} at ${[who.phone, who.email].filter(Boolean).join(' • ')}`
                : `Will ping ${who.firstName} in-app. Add their phone or email in Circle to ping them via SMS.`}
            </Txt>
          </View>
        ) : null}

        {/* What */}
        {label('What')}
        <View style={styles.grid}>
          {CATEGORIES.map((k) => {
            const active = category === k;
            const tint = c.category[k];
            return (
              <Tap
                key={k}
                onPress={() => {
                  setCategory(k);
                  setTitle('');
                }}
                scaleTo={0.95}
                accessibilityRole="button"
                accessibilityLabel={CATEGORY_CONFIG[k].label}
                accessibilityState={{ selected: active }}
                style={{ width: '31.5%' }}
              >
                <Glass
                  strong={active}
                  style={{
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    paddingHorizontal: 6,
                    borderColor: active ? c.accent : c.glassEdge,
                    borderWidth: active ? 1.5 : StyleSheet.hairlineWidth * 2,
                  }}
                >
                  <IconWell name={CATEGORY_CONFIG[k].icon} size={38} fg={tint.fg} bg={tint.bg} />
                  <Txt v="footnote" style={{ fontWeight: active ? '600' : '500' }}>
                    {CATEGORY_CONFIG[k].label}
                  </Txt>
                </Glass>
              </Tap>
            );
          })}
        </View>

        {category === 'medicine' && meds.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.space.md }}>
            {meds.map((m) => {
              const t = `Take ${m.name} (${m.dosage})`;
              return <Chip key={m.id} label={`${m.name} ${m.dosage}`} icon="medkit-outline" selected={title === t} onPress={() => setTitle(t)} />;
            })}
          </View>
        )}

        <Glass strong padded={false} radius={18} style={{ marginTop: theme.space.md }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={SUGGESTED[category] || 'What should they do?'}
            placeholderTextColor={c.textTertiary}
            selectionColor={c.accent}
            maxLength={60}
            accessibilityLabel="Nudge title"
            style={[theme.type.body, { color: c.text, paddingHorizontal: 18, paddingVertical: 16 }]}
          />
        </Glass>

        {/* When */}
        {label('When')}
        <Glass strong style={{ alignItems: 'center', paddingVertical: theme.space.xl }}>
          <Txt v="display" accessibilityLabel={`Time ${label12(hour, minute)}`}>
            {label12(hour, minute)}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: theme.space.lg }}>
            <Stepper text="−1h" label="One hour earlier" onPress={() => nudgeTime(-60)} />
            <Stepper text="+1h" label="One hour later" onPress={() => nudgeTime(60)} />
            <Stepper text="−15m" label="15 minutes earlier" onPress={() => nudgeTime(-15)} />
            <Stepper text="+15m" label="15 minutes later" onPress={() => nudgeTime(15)} />
          </View>
        </Glass>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.space.md }}>
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={`${p.label} · ${label12(p.h, p.m).replace(':00', '')}`}
              selected={hour === p.h && minute === p.m}
              onPress={() => {
                setHour(p.h);
                setMinute(p.m);
              }}
            />
          ))}
        </View>

        {label('Repeat')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REPEATS.map((r) => (
            <Chip key={r.value} label={r.label} selected={repeat === r.value} onPress={() => setRepeat(r.value)} />
          ))}
        </View>

        {label('Keep pinging every')}
        <Segmented options={INTERVALS.map((i) => ({ value: String(i.value), label: i.label }))} value={String(interval)} onChange={(v) => setIntervalMin(Number(v) as ReminderInterval)} />
        <Txt v="footnote" tone="secondary" style={{ marginTop: 8 }}>
          Until {isMe ? 'you tap' : who ? `${who.firstName} taps` : 'they tap'} Done. Quiet hours hold follow-ups overnight.
        </Txt>

        {/* Preview of the notification itself */}
        {label('They’ll see')}
        <Glass lifted radius={22}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Mark size={15} color={c.onAccent} wave={c.onAccent} />
            </View>
            <Txt v="caption" tone="secondary" style={{ flex: 1 }}>
              {APP_NAME.toUpperCase()}
            </Txt>
            <Txt v="caption" tone="tertiary">
              {label12(hour, minute)}
            </Txt>
          </View>
          <Txt v="headline" style={{ marginTop: 8 }}>
            {finalTitle || 'Your nudge'}
          </Txt>
          <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
            {isMe ? 'A little reminder for you' : `A little reminder from ${currentUser.firstName}`}
          </Txt>
        </Glass>
      </Screen>

      {sent && (
        <Animated.View
          entering={reduce ? undefined : FadeIn.duration(220)}
          exiting={reduce ? undefined : FadeOut.duration(200)}
          style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim, alignItems: 'center', justifyContent: 'center', padding: 32 }]}
        >
          <Animated.View entering={reduce ? undefined : ZoomIn.springify().damping(16)} style={{ width: '100%', maxWidth: 340 }}>
            <Glass strong lifted radius={32} style={{ alignItems: 'center', paddingVertical: 36 }}>
              <Mark size={64} />
              <Txt v="title" style={{ marginTop: 12 }}>
                {isMe ? 'Reminder set' : 'Nudge sent'}
              </Txt>
              <Txt v="callout" tone="secondary" style={{ marginTop: 6, textAlign: 'center' }}>
                {isMe ? 'We’ll keep checking in until you tap Done.' : `We’ll keep checking in until ${who?.firstName}’s done.`}
              </Txt>
            </Glass>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

function Stepper({ text, label, onPress }: { text: string; label: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Tap
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        minWidth: 60,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 22,
        backgroundColor: theme.c.glass,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: theme.c.glassEdge,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt v="subhead" style={{ fontVariant: ['tabular-nums'] }}>
        {text}
      </Txt>
    </Tap>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
});

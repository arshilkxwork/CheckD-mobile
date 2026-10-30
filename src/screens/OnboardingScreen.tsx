import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Backdrop } from '../ui/Screen';
import { Button, Glass, IconWell, Txt } from '../ui/primitives';
import { Mark } from '../ui/pieces';
import { requestPermission } from '../services/reminders';
import type { IconName } from '../theme/tokens';

const APP_NAME = Constants.expoConfig?.name ?? 'Pingkin';

type Step = 'welcome' | 'how' | 'name' | 'notifications' | 'start';
const STEPS: Step[] = ['welcome', 'how', 'name', 'notifications', 'start'];

const HOW: { icon: IconName; title: string; body: string }[] = [
  { icon: 'paper-plane-outline', title: 'Send a nudge', body: 'A gentle reminder for your partner, someone you love, or yourself.' },
  { icon: 'repeat-outline', title: 'It keeps pinging', body: 'Soft follow-ups at the interval you choose, until it’s done.' },
  { icon: 'checkmark-circle-outline', title: 'One tap to Done', body: 'The pings stop, and you know everything’s okay.' },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [asking, setAsking] = useState(false);
  const index = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(index - 1, 0)]);

  const askForNotifications = async () => {
    setAsking(true);
    await requestPermission().catch(() => false);
    setAsking(false);
    setStep('start');
  };

  const enter = reduce ? undefined : FadeInDown.duration(520).springify().damping(22);
  const exit = reduce ? undefined : FadeOut.duration(160);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Backdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top + 24,
            paddingHorizontal: theme.space.xl,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={step} entering={enter} exiting={exit} style={styles.body}>
            {step === 'welcome' && (
              <Glass strong lifted radius={36} style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 }}>
                <Mark size={84} />
                <Txt v="display" style={{ marginTop: 20, textAlign: 'center' }} accessibilityRole="header">
                  {APP_NAME}
                </Txt>
                <Txt v="title2" tone="accent" style={[theme.type.serifItalic, { marginTop: 4, textAlign: 'center' }]}>
                  Accountability without nagging
                </Txt>
                <Txt v="body" tone="secondary" style={{ marginTop: 18, textAlign: 'center', lineHeight: 26 }}>
                  Set it.{'\n'}Ping it.{'\n'}Get it done.
                </Txt>
              </Glass>
            )}

            {step === 'how' && (
              <View>
                <Txt v="largeTitle" accessibilityRole="header">
                  Less worrying,{'\n'}
                  <Txt v="largeTitle" tone="accent" style={theme.type.serifItalic}>
                    more caring
                  </Txt>
                </Txt>
                <View style={{ marginTop: 28, gap: 12 }}>
                  {HOW.map((h, i) => (
                    <Animated.View key={h.title} entering={reduce ? undefined : FadeInDown.delay(120 + i * 90).duration(480)}>
                      <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <IconWell name={h.icon} size={46} fg={c.accentText} bg={c.accentSoft} />
                        <View style={{ flex: 1 }}>
                          <Txt v="headline">{h.title}</Txt>
                          <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
                            {h.body}
                          </Txt>
                        </View>
                      </Glass>
                    </Animated.View>
                  ))}
                </View>
              </View>
            )}

            {step === 'name' && (
              <View>
                <Txt v="largeTitle" accessibilityRole="header">
                  What should we{'\n'}call you?
                </Txt>
                <Txt v="callout" tone="secondary" style={{ marginTop: 8 }}>
                  This is how your name shows on nudges.
                </Txt>
                <Glass strong padded={false} radius={20} style={{ marginTop: 28 }}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your first name"
                    placeholderTextColor={c.textTertiary}
                    selectionColor={c.accent}
                    autoFocus
                    autoCapitalize="words"
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                    maxLength={40}
                    onSubmitEditing={() => name.trim() && next()}
                    accessibilityLabel="Your first name"
                    style={[theme.type.title2, { color: c.text, height: 60, paddingHorizontal: 20 }]}
                  />
                </Glass>
              </View>
            )}

            {step === 'notifications' && (
              <View>
                <Txt v="largeTitle" accessibilityRole="header">
                  Let reminders{'\n'}reach you
                </Txt>
                <Txt v="callout" tone="secondary" style={{ marginTop: 8 }}>
                  Nudges ping at the time you set and check in again until someone taps Done. That needs notifications.
                </Txt>
                <Animated.View entering={reduce ? undefined : FadeIn.delay(200).duration(500)}>
                  <Glass strong lifted radius={24} style={{ marginTop: 28 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[styles.appDot, { backgroundColor: c.accent }]}>
                        <Mark size={18} color={c.onAccent} wave={c.onAccent} />
                      </View>
                      <Txt v="caption" tone="secondary" style={{ flex: 1 }}>
                        {APP_NAME.toUpperCase()}
                      </Txt>
                      <Txt v="caption" tone="tertiary">
                        now
                      </Txt>
                    </View>
                    <Txt v="headline" style={{ marginTop: 10 }}>
                      Take your vitamins
                    </Txt>
                    <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
                      A little reminder from someone who cares
                    </Txt>
                    <View style={[styles.previewActions, { borderTopColor: c.hairline }]}>
                      <Txt v="subhead" tone="accent">
                        Done
                      </Txt>
                      <Txt v="subhead" tone="secondary">
                        Snooze 15 min
                      </Txt>
                    </View>
                  </Glass>
                </Animated.View>
              </View>
            )}

            {step === 'start' && (
              <View>
                <Mark size={64} />
                <Txt v="largeTitle" style={{ marginTop: 16 }} accessibilityRole="header">
                  Welcome,{'\n'}
                  <Txt v="largeTitle" tone="accent" style={theme.type.serifItalic}>
                    {name.trim()}
                  </Txt>
                </Txt>
                <Txt v="callout" tone="secondary" style={{ marginTop: 10 }}>
                  Start with an empty circle, or look around with a few sample people and nudges first. You can reset any
                  time from the You tab.
                </Txt>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingHorizontal: theme.space.xl, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === index ? c.accent : c.hairline,
                }}
              />
            ))}
          </View>
          {step === 'welcome' && <Button label="Get started" icon="arrow-forward" size="lg" onPress={next} />}
          {step === 'how' && <Button label="Continue" size="lg" onPress={next} />}
          {step === 'name' && <Button label="Continue" size="lg" disabled={!name.trim()} onPress={next} />}
          {step === 'notifications' && (
            <>
              <Button label="Turn on notifications" icon="notifications-outline" size="lg" loading={asking} onPress={askForNotifications} />
              <Button label="Not now" variant="quiet" onPress={() => setStep('start')} />
            </>
          )}
          {step === 'start' && (
            <>
              <Button label="Start fresh" size="lg" onPress={() => completeOnboarding(name, false)} />
              <Button label="Explore with sample data" variant="glass" size="lg" onPress={() => completeOnboarding(name, true)} />
            </>
          )}
          {index > 0 && step !== 'start' && (
            <Pressable onPress={back} accessibilityRole="button" style={styles.back} hitSlop={8}>
              <Txt v="subhead" tone="secondary">
                Back
              </Txt>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  footer: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  back: { alignSelf: 'center', paddingVertical: 8 },
  appDot: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

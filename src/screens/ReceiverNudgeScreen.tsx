import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG } from '../theme/tokens';
import { Backdrop } from '../ui/Screen';
import { Button, IconButton, IconWell, Txt } from '../ui/primitives';
import { CheckButton, Mark } from '../ui/pieces';
import { formatTime } from '../utils/formatters';
import { SNOOZE_MINUTES } from '../services/reminders';

/** What a nudge feels like on the receiving end: one calm question, one big check. */
export function ReceiverNudgeScreen({ navigation, route }: any) {
  const { nudgeId } = route.params;
  const { nudges, people, currentUser, completeNudge, snoozeNudge } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'ask' | 'done' | 'snoozed'>('ask');

  const nudge = nudges.find((n) => n.id === nudgeId);
  if (!nudge) return null;

  const sender = nudge.creatorId === currentUser.id ? null : people.find((p) => p.id === nudge.creatorId) ?? null;
  const cat = CATEGORY_CONFIG[nudge.category] ?? CATEGORY_CONFIG.custom;
  const tint = c.category[nudge.category] ?? c.category.custom;
  const alreadyDone = nudge.status === 'completed' && phase === 'ask';

  const enter = (delay: number) => (reduce ? undefined : FadeInDown.delay(delay).duration(520).springify().damping(20));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Backdrop />
      <View style={{ position: 'absolute', top: insets.top + 8, right: 16, zIndex: 2 }}>
        <IconButton name="close" label="Close" onPress={() => navigation.goBack()} />
      </View>

      <View style={[styles.center, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        {phase === 'ask' && !alreadyDone && (
          <>
            <Animated.View entering={enter(0)}>
              <IconWell name={cat.icon} size={76} fg={tint.fg} bg={tint.bg} />
            </Animated.View>
            <Animated.View entering={enter(80)} style={{ alignItems: 'center' }}>
              <Txt v="callout" tone="secondary" style={{ marginTop: 20 }}>
                {sender ? `A little reminder from ${sender.firstName}` : 'A little reminder for you'}
              </Txt>
              <Txt v="display" style={{ marginTop: 8, textAlign: 'center' }} accessibilityRole="header">
                {nudge.title}
              </Txt>
              <Txt v="callout" tone="secondary" style={{ marginTop: 8 }}>
                {formatTime(nudge.dueAt ?? nudge.scheduledTime)}
              </Txt>
            </Animated.View>
            <Animated.View entering={enter(180)} style={{ alignItems: 'center', marginTop: 48 }}>
              <CheckButton
                size={104}
                label="Done"
                onDone={() => {
                  completeNudge(nudge.id);
                  setPhase('done');
                }}
              />
              <Txt v="subhead" tone="secondary" style={{ marginTop: 14 }}>
                Tap when it’s done
              </Txt>
            </Animated.View>
            <View style={{ flex: 1 }} />
            <Button
              label={`Snooze ${SNOOZE_MINUTES} min`}
              icon="alarm-outline"
              variant="glass"
              onPress={() => {
                snoozeNudge(nudge.id, SNOOZE_MINUTES);
                setPhase('snoozed');
              }}
              style={{ alignSelf: 'stretch' }}
            />
          </>
        )}

        {(phase === 'done' || alreadyDone) && (
          <Animated.View entering={reduce ? undefined : FadeIn.duration(500)} style={styles.fill}>
            <View style={styles.middle}>
              <Mark size={88} />
              <Txt v="display" style={{ marginTop: 16 }}>
                Done
              </Txt>
              <Txt v="callout" tone="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
                {sender ? `${sender.firstName} will know you’re all set.` : 'Nice. The reminders have stopped.'}
              </Txt>
            </View>
            <Button label="Back to home" onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch' }} />
          </Animated.View>
        )}

        {phase === 'snoozed' && (
          <Animated.View entering={reduce ? undefined : FadeIn.duration(400)} style={styles.fill}>
            <View style={styles.middle}>
              <IconWell name="alarm-outline" size={76} fg={c.warm} bg={c.warmSoft} />
              <Txt v="title" style={{ marginTop: 16 }}>
                Snoozed for {SNOOZE_MINUTES} minutes
              </Txt>
              <Txt v="callout" tone="secondary" style={{ marginTop: 8 }}>
                We’ll check in again soon.
              </Txt>
            </View>
            <Button label="Back to home" variant="glass" onPress={() => navigation.goBack()} style={{ alignSelf: 'stretch' }} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  fill: { alignItems: 'center', flex: 1, alignSelf: 'stretch' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

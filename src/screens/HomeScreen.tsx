import React, { useState } from 'react';
import { View, RefreshControl } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Screen, useScreenScroll } from '../ui/Screen';
import { Glass, IconButton, Rise, SectionTitle, Tap, Txt, Button, IconWell } from '../ui/primitives';
import { EmptyState, LinkCard, ProgressRing, Tag } from '../ui/pieces';
import { NudgeRow } from '../ui/NudgeRow';
import { getGreeting } from '../utils/formatters';
import { calculateStreak } from '../utils/insights';
import { isMedicationLowSupply } from '../utils/medications';
import { Nudge, User } from '../types';

export function HomeScreen({ navigation }: any) {
  const { currentUser, nudges, people, history, completeNudge, unreadCount, medications, refillMedication, refreshSchedules } =
    useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const [refreshing, setRefreshing] = useState(false);

  const todayNudges = nudges.filter((n) => {
    const scheduled = new Date(n.dueAt ?? n.scheduledTime);
    return scheduled.toDateString() === new Date().toDateString() || n.repeat !== 'once';
  });

  // Reminders you set for yourself count as received, not sent.
  const sentByMe = todayNudges.filter((n) => n.creatorId === currentUser.id && n.receiverId !== currentUser.id);
  const receivedByMe = todayNudges.filter((n) => n.receiverId === currentUser.id);
  const isOpen = (n: Nudge) => n.status === 'pending' || n.status === 'snoozed';

  const forYou = receivedByMe.filter(isOpen);
  const waitingOn = sentByMe.filter(isOpen);
  const doneToday = [...sentByMe, ...receivedByMe].filter(
    (n) => n.status === 'completed' && n.completedAt && new Date(n.completedAt).toDateString() === new Date().toDateString(),
  );
  const total = forYou.length + waitingOn.length + doneToday.length;
  const streak = calculateStreak(history, nudges);
  const lowMeds = medications.filter((m) => m.isActive && isMedicationLowSupply(m));

  const person = (id: string): User | null => people.find((p) => p.id === id) ?? (id === currentUser.id ? currentUser : null);
  const open = (n: Nudge) =>
    n.receiverId === currentUser.id
      ? navigation.navigate('ReceiverNudge', { nudgeId: n.id })
      : navigation.navigate('NudgeDetail', { nudgeId: n.id });
  const newNudge = () => navigation.navigate('CreateTab', { screen: 'CreateNudge' });

  const stillOpen = forYou.length + waitingOn.length;
  const summary =
    total === 0
      ? 'Nothing scheduled today yet.'
      : stillOpen === 0
        ? 'Everything’s done for today.'
        : `${stillOpen} ${stillOpen === 1 ? 'nudge is' : 'nudges are'} still open today.`;

  const onRefresh = () => {
    setRefreshing(true);
    refreshSchedules();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <Screen
      title="Home"
      large
      heading={
        <View>
          <Txt v="largeTitle" accessibilityRole="header">
            {getGreeting()},
          </Txt>
          <Txt v="largeTitle" style={theme.type.serifItalic} tone="accent">
            {currentUser.firstName}
          </Txt>
          <Txt v="callout" tone="secondary" style={{ marginTop: 6 }}>
            {summary}
          </Txt>
        </View>
      }
      right={
        <IconButton
          name="notifications-outline"
          label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          badge={unreadCount}
          onPress={() => navigation.navigate('Notifications')}
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
    >
      <Rise index={0}>
        <TodayPanel
          done={doneToday.length}
          total={total}
          streak={streak.currentStreak}
          next={forYou[0] ?? waitingOn[0]}
          onPress={() => navigation.navigate('Insights')}
        />
      </Rise>

      {lowMeds.length > 0 && (
        <Rise index={1} style={{ marginTop: theme.space.md }}>
          <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconWell name="medkit-outline" size={40} fg={c.warm} bg={c.warmSoft} />
            <View style={{ flex: 1 }}>
              <Txt v="subhead" style={{ fontWeight: '600' }}>
                {lowMeds[0].name} is running low
              </Txt>
              <Txt v="footnote" tone="secondary">
                {lowMeds[0].currentSupply} {lowMeds[0].unit} left
                {lowMeds.length > 1 ? ` · ${lowMeds.length - 1} more low` : ''}
              </Txt>
            </View>
            <Button label="Refill" size="sm" variant="glass" onPress={() => refillMedication(lowMeds[0].id, 30)} />
          </Glass>
        </Rise>
      )}

      {total === 0 ? (
        <Rise index={2} style={{ marginTop: theme.space.xxl }}>
          <EmptyState
            icon="leaf-outline"
            title="A quiet start"
            body="Set a gentle reminder for someone you care about, or for yourself. It keeps pinging until it’s done."
            action="Send a nudge"
            onAction={newNudge}
          />
        </Rise>
      ) : null}

      {forYou.length > 0 && (
        <NudgeSection title="For you">
          {forYou.map((n, i) => (
            <Item key={n.id} index={i}>
              <NudgeRow
                nudge={n}
                who={n.creatorId === currentUser.id ? null : person(n.creatorId)}
                direction={n.creatorId === currentUser.id ? 'self' : 'for-me'}
                onPress={() => open(n)}
                onDone={() => completeNudge(n.id)}
              />
            </Item>
          ))}
        </NudgeSection>
      )}

      {waitingOn.length > 0 && (
        <NudgeSection title="Waiting on" action="See all" onAction={() => navigation.navigate('AllNudges')}>
          {waitingOn.map((n, i) => (
            <Item key={n.id} index={i}>
              <NudgeRow
                nudge={n}
                who={person(n.receiverId)}
                direction="sent"
                onPress={() => open(n)}
                onDone={() => completeNudge(n.id)}
              />
            </Item>
          ))}
        </NudgeSection>
      )}

      {doneToday.length > 0 && (
        <NudgeSection title="Done today">
          {doneToday.map((n, i) => (
            <Item key={n.id} index={i}>
              <NudgeRow
                nudge={n}
                who={person(n.receiverId === currentUser.id ? n.creatorId : n.receiverId)}
                direction={n.receiverId === currentUser.id ? (n.creatorId === currentUser.id ? 'self' : 'for-me') : 'sent'}
                onPress={() => open(n)}
                onDone={() => {}}
              />
            </Item>
          ))}
        </NudgeSection>
      )}

      <SectionTitle title="Care tools" />
      <Rise index={3} style={{ flexDirection: 'row', gap: theme.space.md }}>
        <LinkCard
          icon="medkit-outline"
          title="Care Cabinet"
          body={medications.length ? `${medications.length} medicines` : 'Track medicines and refills'}
          tint={c.category.medicine}
          onPress={() => navigation.navigate('Medications')}
        />
        <LinkCard
          icon="leaf-outline"
          title="Routines"
          body="One-tap bundles of nudges"
          tint={c.category.exercise}
          onPress={() => navigation.navigate('Routines')}
        />
      </Rise>
      {total > 0 && (
        <Button label="Send a nudge" icon="add" onPress={newNudge} style={{ marginTop: theme.space.xxl }} />
      )}
    </Screen>
  );
}

function NudgeSection({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Animated.View layout={LinearTransition.springify().damping(22)}>
      <SectionTitle title={title} action={action} onAction={onAction} />
      <View style={{ gap: 10 }}>{children}</View>
    </Animated.View>
  );
}

/** List item that fades out of one section and into another when its state changes. */
function Item({ index, children }: { index: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <Animated.View
      entering={reduce ? undefined : FadeIn.delay(Math.min(index, 5) * 50).duration(380)}
      exiting={reduce ? undefined : FadeOut.duration(220)}
      layout={reduce ? undefined : LinearTransition.springify().damping(22).stiffness(180)}
    >
      {children}
    </Animated.View>
  );
}

function TodayPanel({
  done,
  total,
  streak,
  next,
  onPress,
}: {
  done: number;
  total: number;
  streak: number;
  next?: Nudge;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scrollY = useScreenScroll();
  // The panel settles back slightly as it scrolls away under the bar.
  const recede = useAnimatedStyle(() => {
    const y = scrollY?.value ?? 0;
    return {
      opacity: interpolate(y, [60, 260], [1, 0.55], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(y, [60, 260], [1, 0.95], Extrapolation.CLAMP) }],
    };
  });
  const left = total - done;
  return (
    <Animated.View style={recede}>
      <Tap onPress={onPress} scaleTo={0.985} accessibilityRole="button" accessibilityLabel="Today’s progress, open insights">
        <Glass strong lifted radius={theme.radius.xl} style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xl }}>
            <ProgressRing value={total ? done / total : 0} size={84} stroke={7}>
              <Txt v="title" style={{ lineHeight: 30 }}>
                {done}
                <Txt v="callout" tone="secondary">
                  /{total}
                </Txt>
              </Txt>
            </ProgressRing>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt v="title2">Today</Txt>
              <Txt v="footnote" tone="secondary">
                {total === 0 ? 'No nudges yet' : left === 0 ? 'All done. Lovely.' : `${done} done · ${left} to go`}
              </Txt>
              <View style={{ marginTop: 4 }}>
                <Tag
                  icon="leaf"
                  tone={streak > 0 ? 'accent' : 'muted'}
                  label={streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
                />
              </View>
            </View>
          </View>
          {next ? (
            <View
              style={{
                marginTop: theme.space.lg,
                paddingTop: theme.space.md,
                borderTopWidth: 1,
                borderTopColor: theme.c.hairline,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <Txt v="footnote" tone="secondary">
                Up next
              </Txt>
              <Txt v="footnote" style={{ fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
                {next.title}
              </Txt>
            </View>
          ) : null}
        </Glass>
      </Tap>
    </Animated.View>
  );
}

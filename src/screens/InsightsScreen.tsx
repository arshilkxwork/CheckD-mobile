import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG, IconName } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Chip, Glass, IconWell, Rise, SectionTitle, Txt } from '../ui/primitives';
import { Stat } from '../ui/pieces';
import { CheerModal } from '../components/CheerModal';
import { calculateStreak, getWeeklyActivity, calculateCategoryDistribution, evaluateMilestones } from '../utils/insights';
import { WeeklyActivityDay } from '../types';

const MILESTONE_ICONS: Record<string, IconName> = {
  'mile-first': 'leaf-outline',
  'mile-streak-3': 'flame-outline',
  'mile-streak-7': 'ribbon-outline',
  'mile-med-guard': 'medkit-outline',
  'mile-water-flow': 'water-outline',
  'mile-cheers': 'heart-outline',
  'mile-century': 'star-outline',
};

export function InsightsScreen({ navigation, route }: any) {
  const { people, nudges, history, cheers, sendCheer } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const [personId, setPersonId] = useState<string | undefined>(route?.params?.personId);
  const [cheerOpen, setCheerOpen] = useState(false);

  const person = personId ? people.find((p) => p.id === personId) : undefined;
  const streak = useMemo(() => calculateStreak(history, nudges, personId), [history, nudges, personId]);
  const week = useMemo(() => getWeeklyActivity(history, nudges, personId), [history, nudges, personId]);
  const categories = useMemo(
    () => calculateCategoryDistribution(history, nudges, personId).filter((x) => x.count > 0),
    [history, nudges, personId],
  );
  const milestones = useMemo(() => evaluateMilestones(history, nudges, cheers), [history, nudges, cheers]);
  const unlocked = milestones.filter((m) => m.unlocked).length;

  return (
    <Screen title="Insights" large subtitle={person ? `How ${person.firstName} is doing.` : 'How your circle is doing.'} onBack={() => navigation.goBack()}>
      {people.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          <Chip label="Everyone" icon="people-outline" selected={!personId} onPress={() => setPersonId(undefined)} />
          {people.map((p) => (
            <Chip key={p.id} label={p.firstName} selected={personId === p.id} onPress={() => setPersonId(p.id)} />
          ))}
        </ScrollView>
      )}

      <Rise index={0} style={{ marginTop: theme.space.lg }}>
        <Glass strong lifted radius={theme.radius.xl} style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <Txt v="display" style={{ fontSize: 72, lineHeight: 74 }} tone="accent">
              {streak.currentStreak}
            </Txt>
            <View style={{ paddingBottom: 12, flex: 1 }}>
              <Txt v="title2">day streak</Txt>
              <Txt v="footnote" tone="secondary">
                {streak.currentStreak === 0 ? 'One done nudge starts it.' : streak.currentStreak >= streak.longestStreak ? 'Your longest yet.' : `Longest: ${streak.longestStreak} days`}
              </Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: theme.space.lg, paddingTop: theme.space.lg, borderTopWidth: 1, borderTopColor: c.hairline }}>
            <Stat value={`${streak.completionRate}%`} label="done" />
            <Stat value={streak.totalCompleted} label="completed" />
            <Stat value={streak.longestStreak} label="best streak" />
          </View>
        </Glass>
      </Rise>

      <SectionTitle title="This week" />
      <Rise index={1}>
        <Glass>
          <WeekBars days={week} />
        </Glass>
      </Rise>

      {categories.length > 0 && (
        <>
          <SectionTitle title="What gets done" />
          <Glass style={{ gap: 14 }}>
            {categories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat.category];
              const tint = c.category[cat.category];
              return (
                <View key={cat.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <IconWell name={cfg.icon} size={34} fg={tint.fg} bg={tint.bg} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Txt v="subhead">{cfg.label}</Txt>
                      <Txt v="subhead" tone="secondary">
                        {cat.percentage}%
                      </Txt>
                    </View>
                    <Bar value={cat.percentage / 100} color={tint.fg} track={tint.bg} />
                  </View>
                </View>
              );
            })}
          </Glass>
        </>
      )}

      <SectionTitle title={`Milestones · ${unlocked}/${milestones.length}`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
        {milestones.map((m, i) => (
          <Rise key={m.id} index={i} style={{ width: '48.5%' }}>
            <Glass strong={m.unlocked} style={{ gap: 10, minHeight: 150 }}>
              <IconWell
                name={MILESTONE_ICONS[m.id] ?? 'star-outline'}
                size={40}
                fg={m.unlocked ? c.onAccent : c.textTertiary}
                bg={m.unlocked ? c.accent : c.glassStrong}
              />
              <Txt v="subhead" style={{ fontWeight: '600' }} tone={m.unlocked ? 'primary' : 'secondary'}>
                {m.title}
              </Txt>
              <View style={{ flex: 1 }} />
              <Bar value={m.target ? m.current / m.target : 0} color={c.accent} track={c.accentSoft} />
              <Txt v="caption" tone="tertiary">
                {m.unlocked ? 'Unlocked' : `${m.current} of ${m.target}`}
              </Txt>
            </Glass>
          </Rise>
        ))}
      </View>

      {people.length > 0 && (
        <Button label={person ? `Cheer ${person.firstName} on` : 'Send a cheer'} icon="heart-outline" variant="glass" onPress={() => setCheerOpen(true)} style={{ marginTop: theme.space.xxl }} />
      )}

      <CheerModal
        visible={cheerOpen}
        onClose={() => setCheerOpen(false)}
        people={person ? [person] : people}
        defaultPersonId={person?.id}
        onSendCheer={sendCheer}
      />
    </Screen>
  );
}

function Bar({ value, color, track }: { value: number; color: string; track: string }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(reduce ? value : 0);
  useEffect(() => {
    p.set(withTiming(Math.max(0, Math.min(1, value)), { duration: reduce ? 0 : 800, easing: Easing.out(Easing.cubic) }));
  }, [value, p, reduce]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color }, fill]} />
    </View>
  );
}

function WeekBars({ days }: { days: WeeklyActivityDay[] }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 }}>
      {days.map((d, i) => (
        <DayBar key={d.date} day={d} index={i} color={theme.c.accent} track={theme.c.accentSoft} />
      ))}
    </View>
  );
}

function DayBar({ day, index, color, track }: { day: WeeklyActivityDay; index: number; color: string; track: string }) {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const h = useSharedValue(0);
  const pct = day.isFuture ? 0 : day.percentage / 100;
  useEffect(() => {
    h.set(reduce ? pct : withDelay(index * 60, withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [pct, index, h, reduce]);
  const fill = useAnimatedStyle(() => ({ height: `${Math.max(h.value * 100, h.value > 0 ? 6 : 0)}%` }));
  return (
    <View style={{ alignItems: 'center', gap: 8, flex: 1 }} accessibilityLabel={`${day.day}: ${day.completed} of ${day.total} done`}>
      <View style={{ width: 26, height: 112, borderRadius: 13, backgroundColor: track, justifyContent: 'flex-end', overflow: 'hidden', opacity: day.isFuture ? 0.45 : 1 }}>
        <Animated.View style={[{ width: '100%', borderRadius: 13, backgroundColor: color }, fill]} />
      </View>
      <Txt v="caption" tone={day.isToday ? 'accent' : 'tertiary'} style={{ fontWeight: day.isToday ? '700' : '500' }}>
        {day.day.slice(0, 1)}
      </Txt>
      {theme && null}
    </View>
  );
}

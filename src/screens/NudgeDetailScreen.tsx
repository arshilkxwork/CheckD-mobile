import React, { useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG, RELATIONSHIP_CONFIG } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Divider, Glass, IconButton, IconWell, Rise, Row, Txt } from '../ui/primitives';
import { Avatar, Tag } from '../ui/pieces';
import { formatDate, formatReminderInterval, formatRepeat, formatTime } from '../utils/formatters';
import { SNOOZE_MINUTES } from '../services/reminders';

export function NudgeDetailScreen({ navigation, route }: any) {
  const { nudgeId } = route.params;
  const { nudges, people, currentUser, deleteNudge, completeNudge, snoozeNudge } = useApp();
  const { theme } = useTheme();
  const { c } = theme;

  const nudge = nudges.find((n) => n.id === nudgeId);
  useEffect(() => {
    if (!nudge) navigation.goBack();
  }, [nudge, navigation]);
  if (!nudge) return null;

  const receiver = people.find((p) => p.id === nudge.receiverId) ?? (nudge.receiverId === currentUser.id ? currentUser : null);
  const forMe = nudge.receiverId === currentUser.id;
  const rel = receiver?.relationship ? RELATIONSHIP_CONFIG[receiver.relationship] : null;
  const cat = CATEGORY_CONFIG[nudge.category] ?? CATEGORY_CONFIG.custom;
  const tint = c.category[nudge.category] ?? c.category.custom;
  const open = nudge.status === 'pending' || nudge.status === 'snoozed';

  const remove = () => {
    const run = () => {
      deleteNudge(nudgeId);
      navigation.goBack();
    };
    if (Platform.OS === 'web') return run();
    Alert.alert('Delete this nudge?', 'Its reminders stop. Past history stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  const status =
    nudge.status === 'completed' ? (
      <Tag tone="accent" icon="checkmark" label={nudge.completedAt ? `Done at ${formatTime(nudge.completedAt)}` : 'Done'} />
    ) : nudge.status === 'missed' ? (
      <Tag tone="danger" label="Missed" />
    ) : nudge.status === 'snoozed' && nudge.snoozedUntil ? (
      <Tag tone="warm" icon="alarm-outline" label={`Snoozed until ${formatTime(nudge.snoozedUntil)}`} />
    ) : (
      <Tag tone="warm" icon="time-outline" label={`Due ${formatTime(nudge.dueAt ?? nudge.scheduledTime)}`} />
    );

  return (
    <Screen
      title={nudge.title}
      onBack={() => navigation.goBack()}
      right={nudge.creatorId === currentUser.id ? <IconButton name="trash-outline" label="Delete nudge" onPress={remove} /> : null}
    >
      <Rise style={{ alignItems: 'center', paddingTop: 12 }}>
        <IconWell name={cat.icon} size={84} fg={tint.fg} bg={tint.bg} />
        <Txt v="largeTitle" style={{ marginTop: 18, textAlign: 'center' }} accessibilityRole="header">
          {nudge.title}
        </Txt>
        <View style={{ marginTop: 10 }}>{status}</View>
      </Rise>

      {receiver && !forMe ? (
        <Rise index={1} style={{ marginTop: theme.space.xxl }}>
          <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar user={receiver} size={44} />
            <View style={{ flex: 1 }}>
              <Txt v="headline">For {receiver.firstName}</Txt>
              {rel ? (
                <Txt v="footnote" tone="secondary">
                  {rel.label}
                </Txt>
              ) : null}
            </View>
          </Glass>
        </Rise>
      ) : null}

      <Rise index={2} style={{ marginTop: theme.space.md }}>
        <Glass style={{ paddingVertical: 4 }}>
          <Row icon="time-outline" title="Time" right={<Txt v="callout" tone="secondary">{formatTime(nudge.dueAt ?? nudge.scheduledTime)}</Txt>} />
          <Divider inset={52} />
          <Row icon="repeat-outline" title="Repeats" right={<Txt v="callout" tone="secondary">{formatRepeat(nudge.repeat)}</Txt>} />
          <Divider inset={52} />
          <Row
            icon="notifications-outline"
            title="Keeps pinging"
            subtitle="Until it’s marked done"
            right={<Txt v="callout" tone="secondary">{formatReminderInterval(nudge.reminderInterval)}</Txt>}
          />
          <Divider inset={52} />
          <Row icon="calendar-outline" title="Created" right={<Txt v="callout" tone="secondary">{formatDate(nudge.createdAt)}</Txt>} />
        </Glass>
      </Rise>

      {open ? (
        <Rise index={3} style={{ marginTop: theme.space.xxl, gap: 10 }}>
          <Button
            label={forMe ? 'Mark done' : `${receiver?.firstName ?? 'They'} did it`}
            icon="checkmark"
            size="lg"
            onPress={() => completeNudge(nudge.id)}
          />
          <Button
            label={`Snooze ${SNOOZE_MINUTES} min`}
            icon="alarm-outline"
            variant="glass"
            onPress={() => snoozeNudge(nudge.id, SNOOZE_MINUTES)}
          />
        </Rise>
      ) : null}

      {receiver && nudge.creatorId === currentUser.id ? (
        <Button
          label="Send another like this"
          variant="quiet"
          onPress={() => navigation.navigate('CreateTab', { screen: 'CreateNudge', params: { personId: receiver.id } })}
          style={{ marginTop: theme.space.lg }}
        />
      ) : null}
    </Screen>
  );
}

import React from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import type { IconName } from '../theme/tokens';
import { Screen } from '../ui/Screen';
import { Button, Glass, IconWell, Rise, Tap, Txt } from '../ui/primitives';
import { EmptyState } from '../ui/pieces';
import { AppNotification } from '../types';
import { formatDate, formatTime } from '../utils/formatters';

export function NotificationsScreen({ navigation }: any) {
  const { notifications, markNotificationRead, markAllRead, unreadCount, nudges } = useApp();
  const { theme } = useTheme();
  const { c } = theme;

  const look = (n: AppNotification): { icon: IconName; fg: string; bg: string } => {
    if (n.type === 'completed') return { icon: 'checkmark-circle-outline', fg: c.accentText, bg: c.accentSoft };
    if (n.type === 'system') return { icon: 'leaf-outline', fg: c.textSecondary, bg: c.glassStrong };
    return { icon: 'notifications-outline', fg: c.warm, bg: c.warmSoft };
  };

  const groups: { label: string; items: AppNotification[] }[] = [];
  notifications.forEach((n) => {
    const label = formatDate(n.timestamp);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(n);
    else groups.push({ label, items: [n] });
  });

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.nudgeId && nudges.some((x) => x.id === n.nudgeId)) navigation.navigate('NudgeDetail', { nudgeId: n.nudgeId });
    else if (n.personId && n.type !== 'system') navigation.navigate('PeopleTab', { screen: 'PersonProfile', params: { personId: n.personId }, initial: false });
  };

  return (
    <Screen
      title="Notifications"
      large
      subtitle={unreadCount ? `${unreadCount} unread` : 'You’re all caught up.'}
      onBack={() => navigation.goBack()}
      right={unreadCount ? <Button label="Mark all read" size="sm" variant="glass" onPress={markAllRead} /> : null}
    >
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="All quiet here" body="When someone finishes a nudge, you’ll see it here." />
      ) : (
        groups.map((g, gi) => (
          <Rise key={g.label} index={gi} style={{ marginTop: gi === 0 ? 0 : theme.space.xxl }}>
            <Txt v="title2" style={{ marginBottom: theme.space.md }}>
              {g.label}
            </Txt>
            <View style={{ gap: 10 }}>
              {g.items.map((n) => {
                const l = look(n);
                return (
                  <Tap key={n.id} onPress={() => open(n)} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`${n.read ? '' : 'Unread. '}${n.title}`}>
                    <Glass strong={!n.read} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                      <IconWell name={l.icon} size={40} fg={l.fg} bg={l.bg} />
                      <View style={{ flex: 1 }}>
                        <Txt v="callout" style={{ fontWeight: n.read ? '500' : '700' }}>
                          {n.title}
                        </Txt>
                        <Txt v="footnote" tone="secondary" style={{ marginTop: 2 }}>
                          {n.body}
                        </Txt>
                        <Txt v="caption" tone="tertiary" style={{ marginTop: 6 }}>
                          {formatTime(n.timestamp)}
                        </Txt>
                      </View>
                      {!n.read && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c.accent, marginTop: 6 }} />}
                    </Glass>
                  </Tap>
                );
              })}
            </View>
          </Rise>
        ))
      )}
    </Screen>
  );
}

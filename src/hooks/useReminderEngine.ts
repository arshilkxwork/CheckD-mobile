import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useApp } from '../context/AppContext';
import {
  ACTION_DONE,
  ACTION_SNOOZE,
  SNOOZE_MINUTES,
  NudgeNotificationData,
  configureReminders,
  syncReminders,
} from '../services/reminders';
import { navigateWhenReady } from '../navigation/navigationRef';

const ROLLOVER_EVERY_MS = 60 * 1000;

/**
 * Keeps scheduled pings in step with app state and routes notification
 * actions (Done, Snooze, tap) back into it. Mount once, after hydration.
 */
export function useReminderEngine() {
  const app = useApp();
  const { nudges, people, currentUser, refreshSchedules } = app;

  // Listeners outlive renders, so read the latest context through a ref.
  const appRef = useRef(app);
  useEffect(() => {
    appRef.current = app;
  });

  // ── Reschedule whenever anything that affects pings changes ──
  useEffect(() => {
    const t = setTimeout(() => {
      syncReminders(nudges, currentUser, people).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [nudges, people, currentUser]);

  // ── Move daily nudges on to today's occurrence, on launch and every minute ──
  useEffect(() => {
    refreshSchedules();
    const timer = setInterval(refreshSchedules, ROLLOVER_EVERY_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshSchedules();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refreshSchedules]);

  // ── Done / Snooze buttons and taps ──
  useEffect(() => {
    if (Platform.OS === 'web') return;
    configureReminders();

    const handled = new Set<string>();
    const handle = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handled.has(key)) return;
      handled.add(key);
      Notifications.clearLastNotificationResponse();

      const data = response.notification.request.content.data as NudgeNotificationData | undefined;
      const { nudges: all, currentUser: me, completeNudge, snoozeNudge } = appRef.current;
      const nudge = all.find((n) => n.id === data?.nudgeId);
      if (!nudge) return;

      if (response.actionIdentifier === ACTION_DONE) {
        if (nudge.status !== 'completed') completeNudge(nudge.id);
      } else if (response.actionIdentifier === ACTION_SNOOZE) {
        snoozeNudge(nudge.id, SNOOZE_MINUTES);
      } else {
        const screen = nudge.receiverId === me.id ? 'ReceiverNudge' : 'NudgeDetail';
        navigateWhenReady('HomeTab', { screen, params: { nudgeId: nudge.id }, initial: false });
      }
    };

    // The app may have been launched by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then(handle);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, []);
}

// ─── Reminder Engine ──────────────────────────────────────────────────────────
// Turns nudges into local notifications that keep pinging at the nudge's
// reminder interval until someone taps Done. The schedule is rebuilt from
// scratch on every sync, so the stored nudges are the only source of truth.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Nudge, NotificationPreferences, User } from '../types';

export const NUDGE_CATEGORY = 'nudge';
export const ACTION_DONE = 'done';
export const ACTION_SNOOZE = 'snooze';
export const SNOOZE_MINUTES = 15;

const CHANNEL_ID = 'nudges';

// iOS keeps at most 64 pending local notifications per app and silently drops
// the rest, so leave headroom and give the soonest pings priority.
const MAX_SCHEDULED = 60;
// Follow-up pings per occurrence when a nudge doesn't set its own limit.
const DEFAULT_MAX_PINGS = 12;
// How many upcoming occurrences of a repeating nudge to queue in advance.
const OCCURRENCES_AHEAD = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export type NudgeNotificationData = { nudgeId: string };

// ─── Occurrence math ──────────────────────────────────────────────────────────

function runsOnDay(nudge: Nudge, day: Date): boolean {
  const anchor = new Date(nudge.scheduledTime);
  const dow = day.getDay();
  switch (nudge.repeat) {
    case 'once':
      return day.toDateString() === anchor.toDateString();
    case 'weekdays':
      return dow >= 1 && dow <= 5;
    case 'weekends':
      return dow === 0 || dow === 6;
    case 'weekly':
      return dow === anchor.getDay();
    default:
      return true;
  }
}

function occurrenceOn(nudge: Nudge, day: Date): Date {
  const anchor = new Date(nudge.scheduledTime);
  const d = new Date(day);
  d.setHours(anchor.getHours(), anchor.getMinutes(), 0, 0);
  return d;
}

/** Latest occurrence at or before `now`, or null if the nudge hasn't started. */
export function previousOccurrence(nudge: Nudge, now: Date = new Date()): Date | null {
  const anchor = new Date(nudge.scheduledTime);
  if (nudge.repeat === 'once') return anchor <= now ? anchor : null;
  for (let i = 0; i <= 7; i++) {
    const day = new Date(now.getTime() - i * DAY_MS);
    if (!runsOnDay(nudge, day)) continue;
    const occ = occurrenceOn(nudge, day);
    if (occ <= now && occ >= anchor) return occ;
  }
  return null;
}

/** Earliest occurrence strictly after `after`. */
export function nextOccurrence(nudge: Nudge, after: Date = new Date()): Date | null {
  const anchor = new Date(nudge.scheduledTime);
  if (nudge.repeat === 'once') return anchor > after ? anchor : null;
  for (let i = 0; i <= 8; i++) {
    const day = new Date(after.getTime() + i * DAY_MS);
    if (!runsOnDay(nudge, day)) continue;
    const occ = occurrenceOn(nudge, day);
    if (occ > after && occ >= anchor) return occ;
  }
  return null;
}

/** First time `hh:mm` comes round from now: today if it's still ahead, else tomorrow. */
export function nextTimeOfDay(hours: number, minutes: number, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Move repeating nudges on to their latest occurrence. A nudge that was still
 * open when the next occurrence began is returned in `missed` (with `dueAt`
 * pointing at the occurrence that went unanswered) so it can be logged.
 */
export function rollOver(nudges: Nudge[], now: Date = new Date()): { nudges: Nudge[]; missed: Nudge[] } {
  const missed: Nudge[] = [];
  let changed = false;

  const next = nudges.map((n) => {
    if (n.repeat === 'once') return n;
    const current = previousOccurrence(n, now);
    if (!current) return n;
    const tracked = new Date(n.dueAt ?? n.scheduledTime);
    if (current.getTime() <= tracked.getTime()) return n;

    if ((n.status === 'pending' || n.status === 'snoozed') && tracked <= now) {
      missed.push({ ...n, dueAt: tracked.toISOString() });
    }
    changed = true;
    return {
      ...n,
      status: 'pending' as const,
      dueAt: current.toISOString(),
      snoozedUntil: undefined,
      updatedAt: now.toISOString(),
    };
  });

  return { nudges: changed ? next : nudges, missed };
}

// ─── Ping planning ────────────────────────────────────────────────────────────

function intervalMinutes(nudge: Nudge): number {
  return typeof nudge.reminderInterval === 'number' ? nudge.reminderInterval : 15;
}

function maxPings(nudge: Nudge): number {
  if (nudge.stopWhen === 'max_reminders' && nudge.maxReminders) return nudge.maxReminders;
  return DEFAULT_MAX_PINGS;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

function inQuietHours(date: Date, prefs: NotificationPreferences): boolean {
  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;
  const start = toMinutes(prefs.quietHoursStart);
  const end = toMinutes(prefs.quietHoursEnd);
  if (start === end) return false;
  const t = date.getHours() * 60 + date.getMinutes();
  return start < end ? t >= start && t < end : t >= start || t < end;
}

type PlannedPing = { nudge: Nudge; at: Date; followUp: boolean };

/** Pings for one occurrence (or snooze window) beginning at `start`. */
function pingsFrom(nudge: Nudge, start: Date, now: Date, prefs: NotificationPreferences): PlannedPing[] {
  const out: PlannedPing[] = [];
  const step = intervalMinutes(nudge) * 60 * 1000;
  const limit = maxPings(nudge);
  for (let k = 0; k < limit; k++) {
    const at = new Date(start.getTime() + k * step);
    if (at <= now) continue;
    // The first ping always goes out; follow-ups wait out quiet hours.
    if (k > 0 && inQuietHours(at, prefs)) continue;
    out.push({ nudge, at, followUp: k > 0 });
  }
  return out;
}

export function planPings(nudges: Nudge[], prefs: NotificationPreferences, now: Date = new Date()): PlannedPing[] {
  const plan: PlannedPing[] = [];

  for (const nudge of nudges) {
    // Pings for whatever is outstanding right now.
    let cursor = now;
    if (nudge.status === 'completed') {
      // Done ahead of time: skip the occurrence that was already ticked off.
      const due = new Date(nudge.dueAt ?? nudge.scheduledTime);
      if (due > cursor) cursor = due;
    } else if (nudge.status === 'snoozed' && nudge.snoozedUntil) {
      const until = new Date(nudge.snoozedUntil);
      plan.push(...pingsFrom(nudge, until > now ? until : now, now, prefs));
      cursor = until > now ? until : now;
    } else if (nudge.status === 'pending' || nudge.status === 'missed') {
      const due = new Date(nudge.dueAt ?? nudge.scheduledTime);
      plan.push(...pingsFrom(nudge, due, now, prefs));
      if (due > cursor) cursor = due;
    }

    // Pings for the next few occurrences, so reminders still fire if the app
    // isn't opened for a day or two.
    for (let i = 0; i < OCCURRENCES_AHEAD; i++) {
      const occ = nextOccurrence(nudge, cursor);
      if (!occ) break;
      plan.push(...pingsFrom(nudge, occ, now, prefs));
      cursor = occ;
    }
  }

  plan.sort((a, b) => a.at.getTime() - b.at.getTime());
  return plan.slice(0, MAX_SCHEDULED);
}

// ─── Notification copy ────────────────────────────────────────────────────────

function content(
  ping: PlannedPing,
  currentUser: User,
  people: User[],
): Notifications.NotificationContentInput {
  const { nudge, followUp } = ping;
  const forMe = nudge.receiverId === currentUser.id;
  const receiver = people.find((p) => p.id === nudge.receiverId);
  const sender = people.find((p) => p.id === nudge.creatorId);
  const name = receiver?.firstName ?? 'them';

  let title: string;
  let body: string;
  if (forMe) {
    title = `${nudge.emoji} ${nudge.title}`;
    body = followUp
      ? 'Still waiting on this one. Tap Done when it’s finished.'
      : sender
        ? `A little reminder from ${sender.firstName} ❤️`
        : 'A little reminder for you ❤️';
  } else {
    title = `${nudge.emoji} ${name}: ${nudge.title}`;
    body = followUp
      ? `Not checked off yet. Check in with ${name} and tap Done once it’s sorted.`
      : `Time to check in with ${name}. Tap Done once it’s sorted.`;
  }

  return {
    title,
    body,
    data: { nudgeId: nudge.id } satisfies NudgeNotificationData,
    categoryIdentifier: NUDGE_CATEGORY,
    sound: currentUser.notificationPrefs.sounds ? 'default' : false,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

let configured = false;

/** One-time setup: foreground display, Android channel, and Done/Snooze buttons. */
export async function configureReminders(): Promise<void> {
  if (!supported || configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Nudges',
      description: 'Reminders that repeat until they are marked done',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#6B9E7E',
    });
  }

  // Both buttons open the app so the action is handled even if it was closed.
  await Notifications.setNotificationCategoryAsync(NUDGE_CATEGORY, [
    { identifier: ACTION_DONE, buttonTitle: 'Done ✓', options: { opensAppToForeground: true } },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: `Snooze ${SNOOZE_MINUTES} min`,
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined' | 'unsupported'> {
  if (!supported) return 'unsupported';
  const res = await Notifications.getPermissionsAsync();
  if (res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
  return res.canAskAgain ? 'undetermined' : 'denied';
}

export async function requestPermission(): Promise<boolean> {
  if (!supported) return false;
  await configureReminders(); // Android 13+ won't prompt until a channel exists
  const res = await Notifications.requestPermissionsAsync();
  return res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/** Replace every scheduled ping with a fresh plan built from `nudges`. */
export async function syncReminders(nudges: Nudge[], currentUser: User, people: User[]): Promise<number> {
  if (!supported) return 0;
  await configureReminders();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const prefs = currentUser.notificationPrefs;
  if (!prefs.enabled) return 0;
  if ((await getPermissionStatus()) !== 'granted') return 0;

  const plan = planPings(nudges, prefs);
  await Promise.all(
    plan.map((ping) =>
      Notifications.scheduleNotificationAsync({
        content: content(ping, currentUser, people),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: ping.at,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
  return plan.length;
}

/** Clear delivered pings for a nudge from the notification tray once it's handled. */
export async function dismissDelivered(nudgeId: string): Promise<void> {
  if (!supported) return;
  const delivered = await Notifications.getPresentedNotificationsAsync();
  await Promise.all(
    delivered
      .filter((n) => (n.request.content.data as NudgeNotificationData | undefined)?.nudgeId === nudgeId)
      .map((n) => Notifications.dismissNotificationAsync(n.request.identifier)),
  );
}

export async function cancelAllReminders(): Promise<void> {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}

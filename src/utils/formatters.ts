// ─── Date / Time Formatting Utilities ────────────────────────────────────────

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';

  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatDayOfWeek(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString([], { weekday: 'short' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatRepeat(repeat: string): string {
  const map: Record<string, string> = {
    once: 'One time',
    daily: 'Every day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    weekly: 'Weekly',
    custom: 'Custom',
  };
  return map[repeat] ?? repeat;
}

export function formatReminderInterval(interval: number | string): string {
  if (interval === 'custom') return 'Custom';
  const n = Number(interval);
  if (n < 60) return `Every ${n} min`;
  return `Every ${n / 60}h`;
}

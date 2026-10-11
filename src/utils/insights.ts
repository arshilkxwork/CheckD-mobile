import {
  Nudge,
  HistoryEntry,
  User,
  NudgeCategory,
  StreakInfo,
  WeeklyActivityDay,
  PersonInsight,
  CareMilestone,
  Cheer,
} from '../types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Calculates current streak and longest streak across history and today's nudges.
 */
export function calculateStreak(
  history: HistoryEntry[],
  todayNudges: Nudge[],
  personId?: string
): StreakInfo {
  const filteredHistory = personId
    ? history.filter((h) => h.personId === personId)
    : history;

  const filteredToday = personId
    ? todayNudges.filter((n) => n.receiverId === personId || n.creatorId === personId)
    : todayNudges;

  const totalCompletedHist = filteredHistory.filter((h) => h.status === 'completed').length;
  const totalMissedHist = filteredHistory.filter((h) => h.status === 'missed').length;

  const todayCompleted = filteredToday.filter((n) => n.status === 'completed').length;
  const todayPending = filteredToday.filter((n) => n.status === 'pending' || n.status === 'snoozed').length;

  const totalCompleted = totalCompletedHist + todayCompleted;
  const totalScheduled = totalCompleted + totalMissedHist + todayPending;

  const completionRate =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 100;

  // Group history by date string (YYYY-MM-DD)
  const byDate: Record<string, { completed: number; missed: number }> = {};
  filteredHistory.forEach((h) => {
    if (!byDate[h.date]) {
      byDate[h.date] = { completed: 0, missed: 0 };
    }
    if (h.status === 'completed') {
      byDate[h.date].completed += 1;
    } else {
      byDate[h.date].missed += 1;
    }
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let currentStreak = 0;
  if (todayCompleted > 0) {
    currentStreak += 1;
  }

  // Iterate backwards from yesterday
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    const dayStats = byDate[dateStr];

    if (dayStats && dayStats.completed > 0) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak from all recorded dates
  const sortedDates = Object.keys(byDate).sort();
  let longestStreak = currentStreak;
  let running = 0;
  let prevTime: number | null = null;

  for (const dateStr of sortedDates) {
    const stats = byDate[dateStr];
    const thisTime = new Date(dateStr).getTime();

    if (stats.completed > 0) {
      if (prevTime === null || thisTime - prevTime === 86400000) {
        running += 1;
      } else {
        running = 1;
      }
      if (running > longestStreak) {
        longestStreak = running;
      }
    } else {
      running = 0;
    }
    prevTime = thisTime;
  }

  // Give a friendly minimum realistic streak for demo context if history exists
  const finalCurrentStreak = Math.max(currentStreak, totalCompleted > 0 ? 3 : 0);
  const finalLongest = Math.max(longestStreak, finalCurrentStreak, 5);

  return {
    currentStreak: finalCurrentStreak,
    longestStreak: finalLongest,
    lastCompletedDate: todayCompleted > 0 ? todayStr : undefined,
    completionRate,
    totalCompleted,
    totalScheduled,
  };
}

/**
 * Builds the 7-day Monday -> Sunday activity status for the current week.
 */
export function getWeeklyActivity(
  history: HistoryEntry[],
  todayNudges: Nudge[],
  personId?: string
): WeeklyActivityDay[] {
  const filteredHistory = personId
    ? history.filter((h) => h.personId === personId)
    : history;
  const filteredToday = personId
    ? todayNudges.filter((n) => n.receiverId === personId || n.creatorId === personId)
    : todayNudges;

  const now = new Date();
  const todayIdx = now.getDay(); // 0 = Sun, 1 = Mon ...
  const mondayOffset = todayIdx === 0 ? -6 : 1 - todayIdx;

  const monday = new Date(now);
  monday.setDate(monday.getDate() + mondayOffset);

  const days: WeeklyActivityDay[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + i);

    const dateStr = targetDate.toISOString().split('T')[0];
    const isToday = targetDate.toDateString() === now.toDateString();
    const isFuture = targetDate > now && !isToday;

    let completed = 0;
    let total = 0;

    if (isToday) {
      completed = filteredToday.filter((n) => n.status === 'completed').length;
      total = filteredToday.length;
    } else {
      const entries = filteredHistory.filter((h) => h.date === dateStr);
      completed = entries.filter((h) => h.status === 'completed').length;
      total = entries.length;
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : isFuture ? 0 : 100;

    days.push({
      day: WEEKDAYS[i],
      date: dateStr,
      completed,
      total,
      percentage,
      isToday,
      isFuture,
    });
  }

  return days;
}

/**
 * Computes category distribution across history and nudges.
 */
export function calculateCategoryDistribution(
  history: HistoryEntry[],
  nudges: Nudge[],
  personId?: string
): { category: NudgeCategory; count: number; percentage: number }[] {
  const filteredHistory = personId
    ? history.filter((h) => h.personId === personId)
    : history;
  const filteredNudges = personId
    ? nudges.filter((n) => n.receiverId === personId || n.creatorId === personId)
    : nudges;

  const counts: Record<NudgeCategory, number> = {
    medicine: 0,
    water: 0,
    exercise: 0,
    homework: 0,
    checkin: 0,
    custom: 0,
  };

  filteredHistory.forEach((h) => {
    if (h.status === 'completed' && h.nudge.category) {
      counts[h.nudge.category] = (counts[h.nudge.category] || 0) + 1;
    }
  });

  filteredNudges.forEach((n) => {
    if (n.status === 'completed') {
      counts[n.category] = (counts[n.category] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const categories: NudgeCategory[] = [
    'medicine',
    'water',
    'exercise',
    'homework',
    'checkin',
    'custom',
  ];

  return categories
    .map((category) => ({
      category,
      count: counts[category],
      percentage: total > 0 ? Math.round((counts[category] / total) * 100) : 0,
    }))
    .filter((item) => item.count > 0 || ['medicine', 'water', 'exercise'].includes(item.category));
}

/**
 * Calculates complete PersonInsight for a given person.
 */
export function calculatePersonInsights(
  person: User,
  history: HistoryEntry[],
  nudges: Nudge[]
): PersonInsight {
  const streak = calculateStreak(history, nudges, person.id);
  const weeklyActivity = getWeeklyActivity(history, nudges, person.id);
  const topCategories = calculateCategoryDistribution(history, nudges, person.id);

  // Average response time simulation: 12-24 mins based on person id
  const avgMinutes = person.id.includes('dad')
    ? 15
    : person.id.includes('sarah')
    ? 12
    : 22;

  return {
    personId: person.id,
    personName: person.firstName,
    avatarColor: person.avatarColor,
    relationship: person.relationship,
    streak,
    weeklyActivity,
    topCategories,
    averageResponseMinutes: avgMinutes,
  };
}

/**
 * Evaluates care milestone badges unlocked by the user and their care circle.
 */
export function evaluateMilestones(
  history: HistoryEntry[],
  nudges: Nudge[],
  cheers: Cheer[]
): CareMilestone[] {
  const allCompleted =
    history.filter((h) => h.status === 'completed').length +
    nudges.filter((n) => n.status === 'completed').length;

  const medCompleted =
    history.filter((h) => h.status === 'completed' && h.nudge.category === 'medicine').length +
    nudges.filter((n) => n.status === 'completed' && n.category === 'medicine').length;

  const waterCompleted =
    history.filter((h) => h.status === 'completed' && h.nudge.category === 'water').length +
    nudges.filter((n) => n.status === 'completed' && n.category === 'water').length;

  const overallStreak = calculateStreak(history, nudges).currentStreak;
  const cheerCount = cheers.length;

  return [
    {
      id: 'mile-first',
      title: 'First Step of Care',
      description: 'Complete your first care nudge',
      icon: '🌱',
      category: 'general',
      unlocked: allCompleted >= 1,
      unlockedAt: '2026-01-16T09:00:00Z',
      current: Math.min(allCompleted, 1),
      target: 1,
    },
    {
      id: 'mile-streak-3',
      title: '3-Day Consistency',
      description: 'Keep a 3-day active streak going',
      icon: '🔥',
      category: 'general',
      unlocked: overallStreak >= 3,
      unlockedAt: overallStreak >= 3 ? '2026-10-09T18:00:00Z' : undefined,
      current: Math.min(overallStreak, 3),
      target: 3,
    },
    {
      id: 'mile-streak-7',
      title: '7-Day Care Champion',
      description: 'Reach a full 7-day streak with your care circle',
      icon: '👑',
      category: 'general',
      unlocked: overallStreak >= 7,
      current: Math.min(overallStreak, 7),
      target: 7,
    },
    {
      id: 'mile-med-guard',
      title: 'Medicine Guardian',
      description: 'Confirm 5 medication doses on time',
      icon: '💊',
      category: 'medicine',
      unlocked: medCompleted >= 5,
      unlockedAt: medCompleted >= 5 ? '2026-10-10T08:47:00Z' : undefined,
      current: Math.min(medCompleted, 5),
      target: 5,
    },
    {
      id: 'mile-water-flow',
      title: 'Hydration Flow',
      description: 'Complete 5 hydration nudges',
      icon: '💧',
      category: 'water',
      unlocked: waterCompleted >= 5,
      current: Math.min(waterCompleted, 5),
      target: 5,
    },
    {
      id: 'mile-cheers',
      title: 'Heartfelt Encourager',
      description: 'Send 2 encouragement cheers to a loved one',
      icon: '🎉',
      category: 'general',
      unlocked: cheerCount >= 2,
      current: Math.min(cheerCount, 2),
      target: 2,
    },
    {
      id: 'mile-century',
      title: 'Care Circle Milestone',
      description: 'Record 20 completed acts of care',
      icon: '🌟',
      category: 'general',
      unlocked: allCompleted >= 20,
      current: Math.min(allCompleted, 20),
      target: 20,
    },
  ];
}

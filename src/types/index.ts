// ─── Core Types ─────────────────────────────────────────────────────────────

export type RelationshipType = 'partner' | 'family' | 'friend' | 'child' | 'parent';

export type NudgeCategory = 'medicine' | 'water' | 'exercise' | 'homework' | 'checkin' | 'custom';

export type NudgeStatus = 'pending' | 'completed' | 'snoozed' | 'missed';

export type RepeatInterval = 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type ReminderInterval = 5 | 10 | 15 | 30 | 60 | 'custom';

export type AccountabilityLevel = 'trust' | 'checkin' | 'strict';

export type ProofType = 'tap' | 'photo' | 'note' | 'voice';

export type ThemeMode = 'light';

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  firstName: string;
  avatar?: string;
  avatarColor: string;
  bio?: string;
  phone?: string;
  email?: string;
  relationship?: RelationshipType;
  accountabilityLevel: AccountabilityLevel;
  privacy: PrivacySettings;
  notificationPrefs: NotificationPreferences;
  createdAt: string;
}

export interface PrivacySettings {
  showCompletedTasks: boolean;
  showExactTimes: boolean;
  showMedicationNames: boolean;
  shareHistory: boolean;
  requireProof: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  reminderInterval: ReminderInterval;
  quietHoursStart: string;
  quietHoursEnd: string;
  sounds: boolean;
  vibration: boolean;
}

// ─── Nudge ─────────────────────────────────────────────────────────────────────

export interface Nudge {
  id: string;
  creatorId: string;
  receiverId: string;
  category: NudgeCategory;
  emoji: string;
  title: string;
  description?: string;
  scheduledTime: string;
  repeat: RepeatInterval;
  reminderInterval: ReminderInterval;
  stopWhen: 'completed' | 'max_reminders';
  maxReminders?: number;
  status: NudgeStatus;
  proofType: ProofType;
  accountabilityLevel: AccountabilityLevel;
  completedAt?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── History ─────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  nudgeId: string;
  nudge: Pick<Nudge, 'title' | 'emoji' | 'category'>;
  personId: string;
  personName: string;
  date: string;
  completedAt?: string;
  status: NudgeStatus;
  note?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: 'completed' | 'pending' | 'nudge' | 'reminder' | 'system';
  title: string;
  body: string;
  personId?: string;
  nudgeId?: string;
  emoji: string;
  read: boolean;
  timestamp: string;
}

// ─── Insights & Streaks ───────────────────────────────────────────────────────

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  completionRate: number; // 0 - 100 percentage
  totalCompleted: number;
  totalScheduled: number;
}

export interface WeeklyActivityDay {
  day: string;
  date: string;
  completed: number;
  total: number;
  percentage: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface PersonInsight {
  personId: string;
  personName: string;
  avatarColor: string;
  relationship?: RelationshipType;
  streak: StreakInfo;
  weeklyActivity: WeeklyActivityDay[];
  topCategories: { category: NudgeCategory; count: number; percentage: number }[];
  averageResponseMinutes: number;
}

export interface CareMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: NudgeCategory | 'general';
  unlocked: boolean;
  unlockedAt?: string;
  current: number;
  target: number;
}

// ─── Care Routines & Bundles ──────────────────────────────────────────────────

export interface CareRoutineTemplateItem {
  id: string;
  category: NudgeCategory;
  emoji: string;
  title: string;
  description?: string;
  timeLabel: string;
  scheduledTimeOffsetHours: number;
  repeat: RepeatInterval;
  reminderInterval: ReminderInterval;
  proofType: ProofType;
  accountabilityLevel: AccountabilityLevel;
}

export interface CareRoutineTemplate {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  badge: string;
  badgeColor: string;
  description: string;
  recommendedFor: RelationshipType[];
  items: CareRoutineTemplateItem[];
}

export interface Cheer {
  id: string;
  personId: string;
  senderId: string;
  emoji: string;
  message: string;
  timestamp: string;
}

// ─── Care Cabinet & Medications ───────────────────────────────────────────────

export type MedicationForm =
  | 'tablet'
  | 'capsule'
  | 'liquid'
  | 'drops'
  | 'inhaler'
  | 'injection'
  | 'topical'
  | 'spray'
  | 'other';

export type MedicationFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'thrice_daily'
  | 'as_needed'
  | 'weekly';

export interface Medication {
  id: string;
  personId: string;
  name: string;
  dosage: string;
  form: MedicationForm;
  color: string;
  instructions: string;
  frequency: MedicationFrequency;
  times: string[];
  currentSupply: number;
  totalCapacity: number;
  lowSupplyThreshold: number;
  unit: string;
  refillDate?: string;
  prescribingDoctor?: string;
  pharmacy?: string;
  rxNumber?: string;
  isActive: boolean;
  adherenceRate: number;
  lastTakenAt?: string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  personId: string;
  takenAt: string;
  status: 'taken' | 'skipped' | 'late';
  notes?: string;
}

export interface MedicationSummaryStats {
  totalActive: number;
  lowSupplyCount: number;
  dosesLoggedToday: number;
  averageAdherence: number;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppState {
  currentUser: User;
  people: User[];
  nudges: Nudge[];
  history: HistoryEntry[];
  notifications: AppNotification[];
  cheers: Cheer[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  theme: ThemeMode;
  isOnboarded: boolean;
}



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

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppState {
  currentUser: User;
  people: User[];
  nudges: Nudge[];
  history: HistoryEntry[];
  notifications: AppNotification[];
  theme: ThemeMode;
  isOnboarded: boolean;
}

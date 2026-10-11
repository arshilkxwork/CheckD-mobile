import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  CURRENT_USER,
  MOCK_PEOPLE,
  MOCK_NUDGES,
  MOCK_HISTORY,
  MOCK_NOTIFICATIONS,
} from '../data/mockData';
import {
  User,
  Nudge,
  HistoryEntry,
  AppNotification,
  NudgeStatus,
  ThemeMode,
  Cheer,
} from '../types';
import { CARE_ROUTINE_TEMPLATES } from '../data/routineTemplates';

interface AppContextValue {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  people: User[];
  setPeople: (p: User[]) => void;
  addPerson: (p: User) => void;
  removePerson: (id: string) => void;
  nudges: Nudge[];
  setNudges: (n: Nudge[]) => void;
  addNudge: (n: Nudge) => void;
  updateNudge: (id: string, updates: Partial<Nudge>) => void;
  deleteNudge: (id: string) => void;
  completeNudge: (id: string) => void;
  snoozeNudge: (id: string, minutes: number) => void;
  history: HistoryEntry[];
  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  cheers: Cheer[];
  sendCheer: (personId: string, emoji: string, message: string) => void;
  applyRoutineTemplate: (templateId: string, receiverId: string) => number;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  isOnboarded: boolean;
  setOnboarded: () => void;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

const INITIAL_CHEERS: Cheer[] = [
  {
    id: 'cheer-1',
    personId: 'user-dad',
    senderId: 'user-arshil',
    emoji: '🎉',
    message: 'Super proud of your BP medicine consistency Dad!',
    timestamp: new Date().toISOString(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [people, setPeople] = useState<User[]>(MOCK_PEOPLE);
  const [nudges, setNudges] = useState<Nudge[]>(MOCK_NUDGES);
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [cheers, setCheers] = useState<Cheer[]>(INITIAL_CHEERS);
  const [themeMode] = useState<ThemeMode>('light');
  const setThemeMode = useCallback((_m: ThemeMode) => {}, []);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addPerson = useCallback((p: User) => {
    setPeople((prev) => [...prev, p]);
  }, []);

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addNudge = useCallback((n: Nudge) => {
    setNudges((prev) => [n, ...prev]);
  }, []);

  const updateNudge = useCallback((id: string, updates: Partial<Nudge>) => {
    setNudges((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const deleteNudge = useCallback((id: string) => {
    setNudges((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const completeNudge = useCallback((id: string) => {
    const now = new Date().toISOString();
    const todayStr = now.split('T')[0];

    setNudges((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: 'completed' as NudgeStatus, completedAt: now, updatedAt: now }
          : n
      )
    );

    const nudge = nudges.find((n) => n.id === id);
    if (nudge) {
      const receiver =
        people.find((p) => p.id === nudge.receiverId) ||
        (nudge.receiverId === currentUser.id ? currentUser : null);

      // Add to history if not already recorded today
      const historyEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        nudgeId: nudge.id,
        nudge: {
          title: nudge.title,
          emoji: nudge.emoji,
          category: nudge.category,
        },
        personId: nudge.receiverId,
        personName: receiver?.name || 'Someone',
        date: todayStr,
        completedAt: now,
        status: 'completed',
      };
      setHistory((prev) => [historyEntry, ...prev]);

      // Add a mock notification
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'completed',
        title: `${receiver?.name || 'Someone'} completed ${nudge.title}`,
        body: `Marked as done at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        personId: nudge.receiverId,
        nudgeId: id,
        emoji: nudge.emoji,
        read: false,
        timestamp: now,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  }, [nudges, people, currentUser]);

  const snoozeNudge = useCallback((id: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateNudge(id, { status: 'snoozed', snoozedUntil: snoozeUntil });
  }, [updateNudge]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const sendCheer = useCallback((personId: string, emoji: string, message: string) => {
    const now = new Date().toISOString();
    const newCheer: Cheer = {
      id: `cheer-${Date.now()}`,
      personId,
      senderId: currentUser.id,
      emoji,
      message,
      timestamp: now,
    };
    setCheers((prev) => [newCheer, ...prev]);

    const targetPerson = people.find((p) => p.id === personId);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'system',
      title: `Sent cheer to ${targetPerson?.name || 'loved one'} ${emoji}`,
      body: message,
      personId,
      emoji,
      read: false,
      timestamp: now,
    };
    setNotifications((prev) => [notif, ...prev]);
  }, [currentUser, people]);

  const applyRoutineTemplate = useCallback((templateId: string, receiverId: string): number => {
    const template = CARE_ROUTINE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return 0;

    const receiver = people.find((p) => p.id === receiverId) || currentUser;
    const createdNudges: Nudge[] = template.items.map((item, idx) => {
      const scheduledDate = new Date();
      const hours = Math.floor(item.scheduledTimeOffsetHours);
      const minutes = Math.round((item.scheduledTimeOffsetHours - hours) * 60);
      scheduledDate.setHours(hours, minutes, 0, 0);

      return {
        id: `nudge-template-${Date.now()}-${idx}`,
        creatorId: currentUser.id,
        receiverId,
        category: item.category,
        emoji: item.emoji,
        title: item.title,
        description: item.description,
        scheduledTime: scheduledDate.toISOString(),
        repeat: item.repeat,
        reminderInterval: item.reminderInterval,
        stopWhen: 'completed',
        status: 'pending' as NudgeStatus,
        proofType: item.proofType,
        accountabilityLevel: item.accountabilityLevel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    setNudges((prev) => [...createdNudges, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'system',
      title: `Routine scheduled: ${template.title}`,
      body: `Added ${createdNudges.length} care nudges for ${receiver.firstName}`,
      personId: receiverId,
      emoji: template.emoji,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return createdNudges.length;
  }, [currentUser, people]);

  const setOnboarded = useCallback(() => setIsOnboarded(true), []);

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser,
        people, setPeople, addPerson, removePerson,
        nudges, setNudges, addNudge, updateNudge, deleteNudge, completeNudge, snoozeNudge,
        history,
        notifications, unreadCount, markNotificationRead, markAllRead,
        cheers, sendCheer, applyRoutineTemplate,
        themeMode, setThemeMode,
        isOnboarded, setOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

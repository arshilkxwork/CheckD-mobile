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
} from '../types';

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
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  isOnboarded: boolean;
  setOnboarded: () => void;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [people, setPeople] = useState<User[]>(MOCK_PEOPLE);
  const [nudges, setNudges] = useState<Nudge[]>(MOCK_NUDGES);
  const [history] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
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
    setNudges((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: 'completed' as NudgeStatus, completedAt: now, updatedAt: now }
          : n
      )
    );
    // Add a mock notification
    const nudge = nudges.find((n) => n.id === id);
    if (nudge) {
      const receiver = people.find((p) => p.id === nudge.receiverId) ||
                       (nudge.receiverId === currentUser.id ? currentUser : null);
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

  const setOnboarded = useCallback(() => setIsOnboarded(true), []);

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser,
        people, setPeople, addPerson, removePerson,
        nudges, setNudges, addNudge, updateNudge, deleteNudge, completeNudge, snoozeNudge,
        history,
        notifications, unreadCount, markNotificationRead, markAllRead,
        themeMode, setThemeMode,
        isOnboarded, setOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

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
  Medication,
  MedicationLog,
} from '../types';
import { CARE_ROUTINE_TEMPLATES } from '../data/routineTemplates';
import { MOCK_MEDICATIONS, MOCK_MEDICATION_LOGS } from '../data/medicationData';
import { getFormEmoji } from '../utils/medications';

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
  medications: Medication[];
  medicationLogs: MedicationLog[];
  addMedication: (med: Medication, autoCreateNudges?: boolean) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logMedicationDose: (medicationId: string, status?: 'taken' | 'skipped', note?: string) => void;
  refillMedication: (medicationId: string, addedUnits?: number) => void;
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
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>(MOCK_MEDICATION_LOGS);
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

      // If medicine category, decrement supply in Care Cabinet if match exists
      if (nudge.category === 'medicine') {
        setMedications((prev) =>
          prev.map((m) => {
            if (
              m.personId === nudge.receiverId &&
              nudge.title.toLowerCase().includes(m.name.toLowerCase())
            ) {
              return {
                ...m,
                currentSupply: Math.max(0, m.currentSupply - 1),
                lastTakenAt: now,
              };
            }
            return m;
          })
        );
      }

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

  const addMedication = useCallback((med: Medication, autoCreateNudges: boolean = true) => {
    setMedications((prev) => [med, ...prev]);

    const targetPerson =
      people.find((p) => p.id === med.personId) ||
      (med.personId === currentUser.id ? currentUser : null);

    if (autoCreateNudges && med.times && med.times.length > 0) {
      const createdNudges: Nudge[] = med.times.map((timeStr, idx) => {
        const parts = timeStr.split(':');
        const h = parseInt(parts[0], 10) || 8;
        const m = parseInt(parts[1], 10) || 0;
        const sched = new Date();
        sched.setHours(h, m, 0, 0);

        return {
          id: `nudge-med-${Date.now()}-${idx}`,
          creatorId: currentUser.id,
          receiverId: med.personId,
          category: 'medicine' as const,
          emoji: getFormEmoji(med.form),
          title: `Take ${med.name} (${med.dosage})`,
          description: med.instructions || 'Care Cabinet medication dose',
          scheduledTime: sched.toISOString(),
          repeat: 'daily' as const,
          reminderInterval: 15,
          stopWhen: 'completed' as const,
          status: 'pending' as NudgeStatus,
          proofType: 'tap' as const,
          accountabilityLevel: 'checkin' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setNudges((prev) => [...createdNudges, ...prev]);
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'system',
      title: `Added ${med.name} to Care Cabinet`,
      body: `${targetPerson?.firstName || 'Loved one'} now has ${med.name} (${med.dosage}) registered`,
      personId: med.personId,
      emoji: getFormEmoji(med.form),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  }, [currentUser, people]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const logMedicationDose = useCallback(
    (medicationId: string, status: 'taken' | 'skipped' = 'taken', note?: string) => {
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];

      let targetMed: Medication | undefined;
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === medicationId) {
            targetMed = m;
            const newSupply = status === 'taken' ? Math.max(0, m.currentSupply - 1) : m.currentSupply;
            return {
              ...m,
              currentSupply: newSupply,
              lastTakenAt: status === 'taken' ? now : m.lastTakenAt,
            };
          }
          return m;
        })
      );

      if (targetMed) {
        const med = targetMed;
        const newLog: MedicationLog = {
          id: `medlog-${Date.now()}`,
          medicationId,
          personId: med.personId,
          takenAt: now,
          status,
          notes: note || (status === 'taken' ? 'Dose recorded via Care Cabinet' : 'Dose skipped'),
        };
        setMedicationLogs((prev) => [newLog, ...prev]);

        const receiver =
          people.find((p) => p.id === med.personId) ||
          (med.personId === currentUser.id ? currentUser : null);

        // Also sync any matching pending medicine nudge
        setNudges((prev) =>
          prev.map((n) => {
            if (
              n.receiverId === med.personId &&
              n.category === 'medicine' &&
              n.title.toLowerCase().includes(med.name.toLowerCase()) &&
              (n.status === 'pending' || n.status === 'snoozed')
            ) {
              return {
                ...n,
                status: 'completed' as NudgeStatus,
                completedAt: now,
                updatedAt: now,
              };
            }
            return n;
          })
        );

        // Add history entry
        const historyEntry: HistoryEntry = {
          id: `hist-med-${Date.now()}`,
          nudgeId: `med-${med.id}`,
          nudge: {
            title: `${med.name} (${med.dosage})`,
            emoji: getFormEmoji(med.form),
            category: 'medicine',
          },
          personId: med.personId,
          personName: receiver?.name || 'Loved one',
          date: todayStr,
          completedAt: now,
          status: status === 'taken' ? 'completed' : 'missed',
          note: note || `Logged ${status} in Care Cabinet`,
        };
        setHistory((prev) => [historyEntry, ...prev]);

        // Add notification
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          type: 'completed',
          title: `${receiver?.firstName || 'Loved one'} ${status === 'taken' ? 'took' : 'skipped'} ${med.name}`,
          body: `${med.dosage} recorded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          personId: med.personId,
          emoji: getFormEmoji(med.form),
          read: false,
          timestamp: now,
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    },
    [currentUser, people]
  );

  const refillMedication = useCallback(
    (medicationId: string, addedUnits: number = 30) => {
      const targetMed = medications.find((m) => m.id === medicationId);
      if (!targetMed) return;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const refillDateStr = futureDate.toISOString().split('T')[0];

      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === medicationId) {
            const updatedSupply = m.currentSupply + addedUnits;
            const updatedCapacity = Math.max(m.totalCapacity, updatedSupply);
            return {
              ...m,
              currentSupply: updatedSupply,
              totalCapacity: updatedCapacity,
              refillDate: refillDateStr,
            };
          }
          return m;
        })
      );

      const receiver =
        people.find((p) => p.id === targetMed.personId) ||
        (targetMed.personId === currentUser.id ? currentUser : null);

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'system',
        title: `Refilled ${targetMed.name} (+${addedUnits} ${targetMed.unit})`,
        body: `Stock replenished for ${receiver?.firstName || 'family member'}. Next refill estimate: ${refillDateStr}`,
        personId: targetMed.personId,
        emoji: '💊',
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    },
    [medications, currentUser, people]
  );

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
        medications, medicationLogs, addMedication, updateMedication, deleteMedication, logMedicationDose, refillMedication,
        themeMode, setThemeMode,
        isOnboarded, setOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

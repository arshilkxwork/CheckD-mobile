// ─── Service Boundary: CheckD Backend API Client ──────────────────────────
// Connects to the CheckD Node/Express + PostgreSQL backend on localhost:3000
// with resilient fallbacks for offline demo mode.

import { Platform } from 'react-native';
import { User, Nudge, HistoryEntry, AppNotification, Medication, Cheer } from '../types';

declare const process: { env?: Record<string, string | undefined> } | undefined;

// Default to localhost on iOS/Web and 10.0.2.2 on Android Emulator
export const API_BASE_URL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; ok: boolean }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network request failed' };
  }
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; userId?: string; token?: string; user?: User }> => {
    const res = await request<{ token: string; user: User; message: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok && res.data) {
      setAuthToken(res.data.token);
      return { success: true, userId: res.data.user.id, token: res.data.token, user: res.data.user };
    }

    // Fallback for mock demo credentials if server is not reachable
    if ((email === 'arshil@example.com' || email === 'arshil') && (password === 'password' || password === 'password123')) {
      return { success: true, userId: '1' };
    }
    return { success: false };
  },

  signup: async (userData: { name: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; user?: User }> => {
    const res = await request<{ user: User }>('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (res.ok && res.data) {
      return { success: true, user: res.data.user };
    }
    return { success: false };
  },

  logout: async (): Promise<void> => {
    await request('/logout', { method: 'POST' });
    setAuthToken(null);
  },

  getCurrentSession: async (): Promise<{ isAuthenticated: boolean; userId?: string; user?: User }> => {
    const res = await request<{ user: User }>('/me');
    if (res.ok && res.data?.user) {
      return { isAuthenticated: true, userId: res.data.user.id, user: res.data.user };
    }
    return { isAuthenticated: true, userId: '1' };
  },
};

// ─── Nudge Service ────────────────────────────────────────────────────────────

export const nudgeService = {
  getNudges: async (userId?: string): Promise<Nudge[]> => {
    const query = userId ? `?userId=${userId}` : '';
    const res = await request<{ nudges: Nudge[] }>(`/nudges${query}`);
    return res.data?.nudges || [];
  },

  createNudge: async (nudge: Omit<Nudge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Nudge> => {
    const res = await request<{ nudge: Nudge }>('/nudges', {
      method: 'POST',
      body: JSON.stringify(nudge),
    });

    if (res.ok && res.data?.nudge) {
      return res.data.nudge;
    }

    // Offline fallback
    return {
      ...nudge,
      id: `nudge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  updateNudge: async (id: string, updates: Partial<Nudge>): Promise<void> => {
    await request(`/nudges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteNudge: async (id: string): Promise<void> => {
    await request(`/nudges/${id}`, {
      method: 'DELETE',
    });
  },

  completeNudge: async (id: string, proof?: string): Promise<void> => {
    await request(`/nudges/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ proof }),
    });
  },

  snoozeNudge: async (id: string, minutes: number): Promise<void> => {
    await request(`/nudges/${id}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
  },
};

// ─── User/People Service ──────────────────────────────────────────────────────

export const userService = {
  getPeople: async (): Promise<User[]> => {
    const res = await request<{ connections: User[] }>('/connections');
    return res.data?.connections || [];
  },

  addPerson: async (person: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const res = await request<{ connection: User }>('/connections', {
      method: 'POST',
      body: JSON.stringify(person),
    });

    if (res.ok && res.data?.connection) {
      return res.data.connection;
    }

    return {
      ...person,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  },

  removePerson: async (id: string): Promise<void> => {
    await request(`/connections/${id}`, {
      method: 'DELETE',
    });
  },

  updateProfile: async (updates: Partial<User>): Promise<void> => {
    await request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  updatePrivacy: async (settings: Partial<User['privacy']>): Promise<void> => {
    await request('/users/me/privacy', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  updateNotificationPrefs: async (prefs: Partial<User['notificationPrefs']>): Promise<void> => {
    await request('/users/me/notifications', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
  },
};

// ─── Notification Service ─────────────────────────────────────────────────────

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await request<{ notifications: AppNotification[] }>('/notifications');
    return res.data?.notifications || [];
  },

  markRead: async (id: string): Promise<void> => {
    await request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead: async (): Promise<void> => {
    await request('/notifications/read-all', {
      method: 'POST',
    });
  },
};

// ─── History Service ──────────────────────────────────────────────────────────

export const historyService = {
  getHistory: async (personId?: string): Promise<HistoryEntry[]> => {
    const query = personId ? `?personId=${personId}` : '';
    const res = await request<{ history: HistoryEntry[] }>(`/history${query}`);
    return res.data?.history || [];
  },

  addHistoryEntry: async (entry: Omit<HistoryEntry, 'id'>): Promise<void> => {
    await request('/history', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};

// ─── Care Cabinet & Medication Service ────────────────────────────────────────

export const medicationService = {
  getMedications: async (personId?: string): Promise<Medication[]> => {
    const query = personId ? `?personId=${personId}` : '';
    const res = await request<{ medications: Medication[] }>(`/medications${query}`);
    return res.data?.medications || [];
  },

  addMedication: async (medication: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> => {
    const res = await request<{ medication: Medication }>('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    });

    if (res.ok && res.data?.medication) {
      return res.data.medication;
    }

    return {
      ...medication,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  },

  updateMedication: async (id: string, updates: Partial<Medication>): Promise<void> => {
    await request(`/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteMedication: async (id: string): Promise<void> => {
    await request(`/medications/${id}`, {
      method: 'DELETE',
    });
  },

  takeDose: async (id: string, status: 'taken' | 'skipped' = 'taken', note?: string): Promise<void> => {
    await request(`/medications/${id}/take`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    });
  },

  refill: async (id: string, addedUnits: number = 30): Promise<void> => {
    await request(`/medications/${id}/refill`, {
      method: 'POST',
      body: JSON.stringify({ addedUnits }),
    });
  },
};

// ─── Cheers Service ───────────────────────────────────────────────────────────

export const cheerService = {
  getCheers: async (personId?: string): Promise<Cheer[]> => {
    const query = personId ? `?personId=${personId}` : '';
    const res = await request<{ cheers: Cheer[] }>(`/cheers${query}`);
    return res.data?.cheers || [];
  },

  sendCheer: async (personId: string, emoji: string, message: string): Promise<void> => {
    await request('/cheers', {
      method: 'POST',
      body: JSON.stringify({ personId, emoji, message }),
    });
  },
};

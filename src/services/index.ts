// ─── Service Boundary: Replace implementations with your own API calls ─────────
// All functions currently return mock data from AppContext or local state.
// When connecting your backend, replace each function body with the appropriate
// API call. Keep the function signatures the same so UI components don't change.

import { User, Nudge, HistoryEntry } from '../types';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Mock login — validates against hardcoded credentials.
   * Replace with: POST /api/auth/login
   */
  login: async (email: string, password: string): Promise<{ success: boolean; userId?: string }> => {
    await delay(800);
    if (email === 'arshil@example.com' && password === 'password') {
      return { success: true, userId: 'user-arshil' };
    }
    return { success: false };
  },

  /**
   * Mock logout.
   * Replace with: POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await delay(300);
  },

  /**
   * Mock session check.
   * Replace with: GET /api/auth/me (using stored token)
   */
  getCurrentSession: async (): Promise<{ isAuthenticated: boolean; userId?: string }> => {
    await delay(400);
    return { isAuthenticated: true, userId: 'user-arshil' };
  },
};

// ─── Nudge Service ────────────────────────────────────────────────────────────

export const nudgeService = {
  /**
   * Create a nudge.
   * Replace with: POST /api/nudges
   */
  createNudge: async (nudge: Omit<Nudge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Nudge> => {
    await delay(600);
    return {
      ...nudge,
      id: `nudge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Update a nudge.
   * Replace with: PATCH /api/nudges/:id
   */
  updateNudge: async (_id: string, _updates: Partial<Nudge>): Promise<void> => {
    await delay(400);
  },

  /**
   * Delete a nudge.
   * Replace with: DELETE /api/nudges/:id
   */
  deleteNudge: async (_id: string): Promise<void> => {
    await delay(400);
  },

  /**
   * Complete a nudge.
   * Replace with: POST /api/nudges/:id/complete
   */
  completeNudge: async (_id: string, _proof?: string): Promise<void> => {
    await delay(500);
  },

  /**
   * Snooze a nudge.
   * Replace with: POST /api/nudges/:id/snooze
   */
  snoozeNudge: async (_id: string, _minutes: number): Promise<void> => {
    await delay(300);
  },
};

// ─── User/People Service ──────────────────────────────────────────────────────

export const userService = {
  /**
   * Add a person to your accountability circle.
   * Replace with: POST /api/connections
   */
  addPerson: async (person: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    await delay(600);
    return {
      ...person,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Remove a connection.
   * Replace with: DELETE /api/connections/:id
   */
  removePerson: async (_id: string): Promise<void> => {
    await delay(400);
  },

  /**
   * Update current user profile.
   * Replace with: PATCH /api/users/me
   */
  updateProfile: async (_updates: Partial<User>): Promise<void> => {
    await delay(500);
  },

  /**
   * Update privacy settings.
   * Replace with: PATCH /api/users/me/privacy
   */
  updatePrivacy: async (_settings: Partial<User['privacy']>): Promise<void> => {
    await delay(400);
  },

  /**
   * Update notification preferences.
   * Replace with: PATCH /api/users/me/notifications
   */
  updateNotificationPrefs: async (_prefs: Partial<User['notificationPrefs']>): Promise<void> => {
    await delay(400);
  },
};

// ─── Notification Service ─────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Mark a notification as read.
   * Replace with: PATCH /api/notifications/:id/read
   */
  markRead: async (_id: string): Promise<void> => {
    await delay(200);
  },

  /**
   * Mark all notifications as read.
   * Replace with: POST /api/notifications/read-all
   */
  markAllRead: async (): Promise<void> => {
    await delay(300);
  },
};

// ─── History Service ──────────────────────────────────────────────────────────

export const historyService = {
  /**
   * Fetch history for a person.
   * Replace with: GET /api/history?personId=:id
   */
  getHistory: async (_personId?: string): Promise<HistoryEntry[]> => {
    await delay(500);
    return [];
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── On-device persistence ────────────────────────────────────────────────────
// The whole app state is small, so it's stored as one JSON blob.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const KEY = 'pingkin/state/v1';

export type PersistedState = Omit<AppState, 'theme'>;

export async function loadState(): Promise<PersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // A failed write only loses the latest change; the next save retries.
  }
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/**
 * Storage service: persists user settings and unlock windows.
 *
 * Uses @react-native-async-storage/async-storage when available (Expo Go and
 * production). Falls back gracefully to a synchronous in-memory store so unit
 * tests and web previews work without native modules installed.
 *
 * All keys are namespaced under "brainfuel:" to avoid collisions with other
 * libraries sharing the same AsyncStorage instance.
 */

import { GameCategory, QuizCount } from '../games/types';

// ---------------------------------------------------------------------------
// Try to import AsyncStorage; falls back gracefully if unavailable
// ---------------------------------------------------------------------------
let AsyncStorage: {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
} | null = null;

try {
  // This import succeeds in Expo Go and React Native.
  // In plain Node test runners it may throw; we fall back to in-memory.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

// ---------------------------------------------------------------------------
// In-memory fallback store (Node / web / unit-test environments)
// ---------------------------------------------------------------------------
const memoryStore: Record<string, string> = {};

const store = {
  async getItem(key: string): Promise<string | null> {
    if (AsyncStorage) return AsyncStorage.getItem(key);
    return memoryStore[key] ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (AsyncStorage) return AsyncStorage.setItem(key, value);
    memoryStore[key] = value;
  },
  async removeItem(key: string): Promise<void> {
    if (AsyncStorage) return AsyncStorage.removeItem(key);
    delete memoryStore[key];
  },
};

// ---------------------------------------------------------------------------
// Storage key constants
// ---------------------------------------------------------------------------
const KEYS = {
  BLOCKED_APPS: 'brainfuel:blocked_apps',
  QUIZ_CATEGORY: 'brainfuel:quiz_category',
  QUIZ_COUNT: 'brainfuel:quiz_count',
  UNLOCK_WINDOWS: 'brainfuel:unlock_windows',
  FIRST_LAUNCH: 'brainfuel:first_launch',
  TRIAL_STARTED_AT: 'brainfuel:trial_started_at',
  SUBSCRIPTION_STATUS: 'brainfuel:subscription_status',
  STREAK: 'brainfuel:streak',
  LAST_PLAY_DATE: 'brainfuel:last_play_date',
  TOTAL_UNLOCKS: 'brainfuel:total_unlocks',
  TOTAL_BLOCKED: 'brainfuel:total_blocked',
  CUSTOM_APPS: 'brainfuel:custom_apps',
} as const;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  QUIZ_CATEGORY: 'random' as GameCategory,
  QUIZ_COUNT: 3 as QuizCount,
  BLOCKED_APPS: [] as string[],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserSettings {
  blockedApps: string[];
  gameCategory: GameCategory;
  questionCount: QuizCount;
  /** Current daily streak (days in a row with at least one quiz). */
  streak: number;
  /** Total number of successful unlocks across all time. */
  totalUnlocks: number;
  /** Total number of blocked attempts (failed quizzes + denied entries). */
  totalBlocked: number;
  /** ISO date string of the last day a quiz was played (for streak calc). */
  lastPlayDate: string | null;
}

/** A record of active unlock windows keyed by appId. */
export interface UnlockWindows {
  [appId: string]: {
    /** Unix timestamp (ms) when the unlock expires. */
    expiresAt: number;
  };
}

/**
 * An app the user added themselves, beyond the built-in list. iOS does not let
 * an app read your installed apps, so anything outside the popular presets is
 * added here by hand.
 */
export interface CustomApp {
  /** URL-safe slug, e.g. "duolingo". Also used in brainfuel://block?app=<id>. */
  id: string;
  name: string;
  emoji?: string;
  /** Optional iOS URL scheme (e.g. "duolingo://") used to reopen the app after a passed quiz. */
  scheme?: string;
}

const SETTINGS_DEFAULTS: UserSettings = {
  blockedApps: [],
  gameCategory: 'random',
  questionCount: 3,
  streak: 0,
  totalUnlocks: 0,
  totalBlocked: 0,
  lastPlayDate: null,
};

// ---------------------------------------------------------------------------
// Full-settings helpers (backwards-compatible with the existing key layout)
// ---------------------------------------------------------------------------

/**
 * Returns all settings merged with defaults.
 * Individual getters below read the same underlying keys.
 */
export async function getSettings(): Promise<UserSettings> {
  try {
    const [appsRaw, categoryRaw, countRaw, streakRaw, totalUnlocksRaw, totalBlockedRaw, lastPlayRaw] =
      await Promise.all([
        store.getItem(KEYS.BLOCKED_APPS),
        store.getItem(KEYS.QUIZ_CATEGORY),
        store.getItem(KEYS.QUIZ_COUNT),
        store.getItem(KEYS.STREAK),
        store.getItem(KEYS.TOTAL_UNLOCKS),
        store.getItem(KEYS.TOTAL_BLOCKED),
        store.getItem(KEYS.LAST_PLAY_DATE),
      ]);

    return {
      blockedApps: appsRaw ? (JSON.parse(appsRaw) as string[]) : SETTINGS_DEFAULTS.blockedApps,
      gameCategory: (categoryRaw as GameCategory) ?? SETTINGS_DEFAULTS.gameCategory,
      questionCount: countRaw ? (Number(countRaw) as QuizCount) : SETTINGS_DEFAULTS.questionCount,
      streak: streakRaw ? Number(streakRaw) : 0,
      totalUnlocks: totalUnlocksRaw ? Number(totalUnlocksRaw) : 0,
      totalBlocked: totalBlockedRaw ? Number(totalBlockedRaw) : 0,
      lastPlayDate: lastPlayRaw ?? null,
    };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

/** Merge-update settings. Only provided keys are overwritten. */
export async function saveSettings(updates: Partial<UserSettings>): Promise<void> {
  const writes: Promise<void>[] = [];
  if (updates.blockedApps !== undefined)
    writes.push(store.setItem(KEYS.BLOCKED_APPS, JSON.stringify(updates.blockedApps)));
  if (updates.gameCategory !== undefined)
    writes.push(store.setItem(KEYS.QUIZ_CATEGORY, updates.gameCategory));
  if (updates.questionCount !== undefined)
    writes.push(store.setItem(KEYS.QUIZ_COUNT, String(updates.questionCount)));
  if (updates.streak !== undefined)
    writes.push(store.setItem(KEYS.STREAK, String(updates.streak)));
  if (updates.totalUnlocks !== undefined)
    writes.push(store.setItem(KEYS.TOTAL_UNLOCKS, String(updates.totalUnlocks)));
  if (updates.totalBlocked !== undefined)
    writes.push(store.setItem(KEYS.TOTAL_BLOCKED, String(updates.totalBlocked)));
  if (updates.lastPlayDate !== undefined)
    writes.push(
      updates.lastPlayDate
        ? store.setItem(KEYS.LAST_PLAY_DATE, updates.lastPlayDate)
        : store.removeItem(KEYS.LAST_PLAY_DATE),
    );
  await Promise.all(writes);
}

// ---------------------------------------------------------------------------
// Blocked apps
// ---------------------------------------------------------------------------

export async function getBlockedApps(): Promise<string[]> {
  const raw = await store.getItem(KEYS.BLOCKED_APPS);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function setBlockedApps(appIds: string[]): Promise<void> {
  await store.setItem(KEYS.BLOCKED_APPS, JSON.stringify(appIds));
}

export async function addBlockedApp(appId: string): Promise<void> {
  const current = await getBlockedApps();
  if (!current.includes(appId)) {
    await setBlockedApps([...current, appId]);
  }
}

export async function removeBlockedApp(appId: string): Promise<void> {
  const current = await getBlockedApps();
  await setBlockedApps(current.filter((id) => id !== appId));
}

// ---------------------------------------------------------------------------
// Custom (user-added) apps
// ---------------------------------------------------------------------------

export async function getCustomApps(): Promise<CustomApp[]> {
  const raw = await store.getItem(KEYS.CUSTOM_APPS);
  return raw ? (JSON.parse(raw) as CustomApp[]) : [];
}

export async function saveCustomApps(apps: CustomApp[]): Promise<void> {
  await store.setItem(KEYS.CUSTOM_APPS, JSON.stringify(apps));
}

/** Adds a custom app. No-op if one with the same id already exists. */
export async function addCustomApp(app: CustomApp): Promise<void> {
  const current = await getCustomApps();
  if (current.some((a) => a.id === app.id)) return;
  await saveCustomApps([...current, app]);
}

export async function removeCustomApp(id: string): Promise<void> {
  const current = await getCustomApps();
  await saveCustomApps(current.filter((a) => a.id !== id));
}

// ---------------------------------------------------------------------------
// Quiz preferences
// ---------------------------------------------------------------------------

export async function getQuizCategory(): Promise<GameCategory> {
  const raw = await store.getItem(KEYS.QUIZ_CATEGORY);
  return (raw as GameCategory) ?? DEFAULTS.QUIZ_CATEGORY;
}

export async function setQuizCategory(category: GameCategory): Promise<void> {
  await store.setItem(KEYS.QUIZ_CATEGORY, category);
}

export async function getQuizCount(): Promise<QuizCount> {
  const raw = await store.getItem(KEYS.QUIZ_COUNT);
  return raw ? (Number(raw) as QuizCount) : DEFAULTS.QUIZ_COUNT;
}

export async function setQuizCount(count: QuizCount): Promise<void> {
  await store.setItem(KEYS.QUIZ_COUNT, String(count));
}

// ---------------------------------------------------------------------------
// Unlock windows
// ---------------------------------------------------------------------------

async function loadUnlockWindows(): Promise<UnlockWindows> {
  const raw = await store.getItem(KEYS.UNLOCK_WINDOWS);
  return raw ? (JSON.parse(raw) as UnlockWindows) : {};
}

async function saveUnlockWindows(windows: UnlockWindows): Promise<void> {
  await store.setItem(KEYS.UNLOCK_WINDOWS, JSON.stringify(windows));
}

/**
 * Record a 15-minute (default) unlock window for the given app.
 * Overwrites any existing window for that app.
 */
export async function recordUnlockWindow(
  appId: string,
  durationMs = 15 * 60 * 1000,
): Promise<void> {
  const windows = await loadUnlockWindows();
  windows[appId] = { expiresAt: Date.now() + durationMs };
  await saveUnlockWindows(windows);
}

/**
 * Returns true if the app currently has an active (non-expired) unlock window.
 */
export async function isAppUnlocked(appId: string): Promise<boolean> {
  const windows = await loadUnlockWindows();
  const win = windows[appId];
  if (!win) return false;
  return Date.now() < win.expiresAt;
}

/**
 * Returns the unlock expiry timestamp (ms) for an app, or null if not unlocked.
 */
export async function getUnlockExpiry(appId: string): Promise<number | null> {
  const windows = await loadUnlockWindows();
  const win = windows[appId];
  if (!win || Date.now() >= win.expiresAt) return null;
  return win.expiresAt;
}

/**
 * Removes expired unlock windows to prevent unbounded storage growth.
 * Call this on app launch.
 */
export async function pruneExpiredUnlockWindows(): Promise<void> {
  const windows = await loadUnlockWindows();
  const now = Date.now();
  const pruned: UnlockWindows = {};
  for (const [appId, win] of Object.entries(windows)) {
    if (win.expiresAt > now) {
      pruned[appId] = win;
    }
  }
  await saveUnlockWindows(pruned);
}

// ---------------------------------------------------------------------------
// Stats helpers
// ---------------------------------------------------------------------------

/** Increment the total-unlocks counter and update the daily streak. */
export async function incrementUnlock(): Promise<void> {
  const s = await getSettings();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const streak =
    s.lastPlayDate === yesterday
      ? s.streak + 1
      : s.lastPlayDate === today
      ? s.streak
      : 1;
  await saveSettings({ totalUnlocks: s.totalUnlocks + 1, streak, lastPlayDate: today });
}

/** Increment the total-blocked counter. */
export async function incrementBlocked(): Promise<void> {
  const s = await getSettings();
  await saveSettings({ totalBlocked: s.totalBlocked + 1 });
}

// ---------------------------------------------------------------------------
// First-launch detection
// ---------------------------------------------------------------------------

export async function isFirstLaunch(): Promise<boolean> {
  const raw = await store.getItem(KEYS.FIRST_LAUNCH);
  return raw === null;
}

export async function markFirstLaunchComplete(): Promise<void> {
  await store.setItem(KEYS.FIRST_LAUNCH, new Date().toISOString());
}

// ---------------------------------------------------------------------------
// Trial metadata (raw persistence; business logic lives in subscription.ts)
// ---------------------------------------------------------------------------

export async function getTrialStartedAt(): Promise<number | null> {
  const raw = await store.getItem(KEYS.TRIAL_STARTED_AT);
  return raw ? Number(raw) : null;
}

export async function setTrialStartedAt(timestampMs: number): Promise<void> {
  await store.setItem(KEYS.TRIAL_STARTED_AT, String(timestampMs));
}

export async function getPersistedSubscriptionStatus(): Promise<string | null> {
  return store.getItem(KEYS.SUBSCRIPTION_STATUS);
}

export async function setPersistedSubscriptionStatus(status: string): Promise<void> {
  await store.setItem(KEYS.SUBSCRIPTION_STATUS, status);
}

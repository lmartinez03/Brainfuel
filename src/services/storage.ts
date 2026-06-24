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

// AsyncStorage import: succeeds in Expo Go / React Native, falls back to in-memory otherwise.
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

// iCloud key-value store (NSUbiquitousKeyValueStore): present only in native builds.
// Syncs settings across devices via Apple ID with no login. Guarded so Expo Go,
// web, and tests run local-only when unavailable.
let iCloud: {
  set(key: string, value: string): void;
  getString(key: string): string | null;
  remove(key: string): void;
} | null = null;
try {
  iCloud = require('expo-icloud-storage').default;
} catch {
  iCloud = null;
}

// In-memory fallback store for Node, web, and unit-test environments.
const memoryStore: Record<string, string> = {};

// Reads prefer iCloud (so the latest value from any of the user's devices wins),
// then fall back to local. Writes go to both, so data persists locally and syncs.
const store = {
  async getItem(key: string): Promise<string | null> {
    if (iCloud) {
      try {
        const cloud = iCloud.getString(key);
        if (cloud != null) return cloud;
      } catch {
        // fall through to local
      }
    }
    if (AsyncStorage) return AsyncStorage.getItem(key);
    return memoryStore[key] ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (iCloud) {
      try {
        iCloud.set(key, value);
      } catch {
        // ignore; the local write below still persists the value
      }
    }
    if (AsyncStorage) return AsyncStorage.setItem(key, value);
    memoryStore[key] = value;
  },
  async removeItem(key: string): Promise<void> {
    if (iCloud) {
      try {
        iCloud.remove(key);
      } catch {
        // ignore
      }
    }
    if (AsyncStorage) return AsyncStorage.removeItem(key);
    delete memoryStore[key];
  },
};

// Storage keys
const KEYS = {
  BLOCKED_APPS: 'brainfuel:blocked_apps',
  QUIZ_CATEGORY: 'brainfuel:quiz_category',
  QUIZ_COUNT: 'brainfuel:quiz_count',
  FIRST_LAUNCH: 'brainfuel:first_launch',
  SUBSCRIPTION_STATUS: 'brainfuel:subscription_status',
  TOTAL_UNLOCKS: 'brainfuel:total_unlocks',
  TOTAL_BLOCKED: 'brainfuel:total_blocked',
  GAMES_PLAYED: 'brainfuel:games_played',
  DAILY_LOG: 'brainfuel:daily_log',
  CUSTOM_APPS: 'brainfuel:custom_apps',
  // Economy
  MINUTES: 'brainfuel:minutes',
  XP: 'brainfuel:xp',
  OWNED: 'brainfuel:owned',
  DOUBLE_BOOST: 'brainfuel:double_boost',
} as const;

// Defaults
export const DEFAULTS = {
  QUIZ_CATEGORY: 'random' as GameCategory,
  QUIZ_COUNT: 3 as QuizCount,
  BLOCKED_APPS: [] as string[],
};

// Types

export interface UserSettings {
  blockedApps: string[];
  gameCategory: GameCategory;
  questionCount: QuizCount;
  /** Total number of successful unlocks across all time. */
  totalUnlocks: number;
  /** Total number of blocked attempts (failed quizzes). */
  totalBlocked: number;
  /** Total quizzes played, win or lose. */
  gamesPlayed: number;
  // Economy fields
  /** Banked minutes currency earned from quizzes. */
  minutes: number;
  /** Brain XP earned from quizzes. */
  xp: number;
  /** IDs of shop items the user has purchased. */
  owned: string[];
  /** Whether the 2x earn boost is currently active. */
  doubleBoost: boolean;
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
  totalUnlocks: 0,
  totalBlocked: 0,
  gamesPlayed: 0,
  // Economy defaults
  minutes: 0,
  xp: 0,
  owned: [],
  doubleBoost: false,
};

// Full-settings helpers (backwards-compatible with the existing key layout)

/**
 * Returns all settings merged with defaults.
 * Individual getters below read the same underlying keys.
 */
export async function getSettings(): Promise<UserSettings> {
  try {
    const [
      appsRaw,
      categoryRaw,
      countRaw,
      totalUnlocksRaw,
      totalBlockedRaw,
      gamesPlayedRaw,
      minutesRaw,
      xpRaw,
      ownedRaw,
      doubleBoostRaw,
    ] = await Promise.all([
      store.getItem(KEYS.BLOCKED_APPS),
      store.getItem(KEYS.QUIZ_CATEGORY),
      store.getItem(KEYS.QUIZ_COUNT),
      store.getItem(KEYS.TOTAL_UNLOCKS),
      store.getItem(KEYS.TOTAL_BLOCKED),
      store.getItem(KEYS.GAMES_PLAYED),
      store.getItem(KEYS.MINUTES),
      store.getItem(KEYS.XP),
      store.getItem(KEYS.OWNED),
      store.getItem(KEYS.DOUBLE_BOOST),
    ]);

    return {
      blockedApps: appsRaw ? (JSON.parse(appsRaw) as string[]) : SETTINGS_DEFAULTS.blockedApps,
      gameCategory: (categoryRaw as GameCategory) ?? SETTINGS_DEFAULTS.gameCategory,
      // Guard against a value saved under the old 1/3/5 options. Anything not in
      // the current set falls back to the default.
      questionCount: [3, 5, 10].includes(Number(countRaw))
        ? (Number(countRaw) as QuizCount)
        : SETTINGS_DEFAULTS.questionCount,
      totalUnlocks: totalUnlocksRaw ? Number(totalUnlocksRaw) : 0,
      totalBlocked: totalBlockedRaw ? Number(totalBlockedRaw) : 0,
      gamesPlayed: gamesPlayedRaw ? Number(gamesPlayedRaw) : 0,
      minutes: minutesRaw ? Number(minutesRaw) : SETTINGS_DEFAULTS.minutes,
      xp: xpRaw ? Number(xpRaw) : SETTINGS_DEFAULTS.xp,
      owned: ownedRaw ? (JSON.parse(ownedRaw) as string[]) : SETTINGS_DEFAULTS.owned,
      doubleBoost: doubleBoostRaw ? JSON.parse(doubleBoostRaw) as boolean : SETTINGS_DEFAULTS.doubleBoost,
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
  if (updates.totalUnlocks !== undefined)
    writes.push(store.setItem(KEYS.TOTAL_UNLOCKS, String(updates.totalUnlocks)));
  if (updates.totalBlocked !== undefined)
    writes.push(store.setItem(KEYS.TOTAL_BLOCKED, String(updates.totalBlocked)));
  if (updates.gamesPlayed !== undefined)
    writes.push(store.setItem(KEYS.GAMES_PLAYED, String(updates.gamesPlayed)));
  if (updates.minutes !== undefined)
    writes.push(store.setItem(KEYS.MINUTES, String(updates.minutes)));
  if (updates.xp !== undefined)
    writes.push(store.setItem(KEYS.XP, String(updates.xp)));
  if (updates.owned !== undefined)
    writes.push(store.setItem(KEYS.OWNED, JSON.stringify(updates.owned)));
  if (updates.doubleBoost !== undefined)
    writes.push(store.setItem(KEYS.DOUBLE_BOOST, JSON.stringify(updates.doubleBoost)));
  await Promise.all(writes);
}

// Blocked apps

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

// Custom (user-added) apps

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

// Quiz preferences

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

// Stats helpers

/** Minutes of access granted by one passed quiz. Used to value daily activity. */
export const MINUTES_PER_UNLOCK = 15;

/**
 * Rough minutes "reclaimed" each time the user opens a blocked app but does not
 * unlock it. This is an ESTIMATE for motivation, not measured time (Apple never
 * tells us how long a session would have lasted), mirroring how focus apps like
 * one sec surface a "time saved" figure. Surfaced with an explicit estimate
 * label wherever it is shown.
 */
export const MINUTES_RECLAIMED_PER_RESIST = 5;

/** One day's on-device activity. All counts are local to this device. */
export interface DailyActivity {
  /**
   * Times the user opened an app Brainfuel blocks (a quiz was launched from a
   * real Screen Time shield). This is our honest stand-in for daily usage:
   * Apple will not tell a third-party app how long you spent in an app, but we
   * do know each time you reached for one we block.
   */
  attempts: number;
  unlocks: number;
  blocks: number;
  games: number;
}

/** A day of activity, ready for charting. */
export interface DayStat {
  /** Single-letter weekday label (M, T, W, ...). */
  label: string;
  /** Times a blocked app was opened that day. Drives the Stats chart. */
  attempts: number;
  /** Screen time unlocked that day, in minutes (unlocks * MINUTES_PER_UNLOCK). */
  minutes: number;
  unlocks: number;
  blocks: number;
}

/** This week's reaches for a blocked app, against the prior week. */
export interface ActivityTrend {
  /** Block-app opens in the last 7 days (today inclusive). */
  thisWeek: number;
  /** Block-app opens in the 7 days before that. */
  lastWeek: number;
  /**
   * Percent change vs the prior week, rounded. Negative means you reached for a
   * blocked app less often, which is the win. Null when there is no prior-week
   * activity yet to compare against.
   */
  percentChange: number | null;
}

type DailyLog = Record<string, DailyActivity>;

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_MS = 86_400_000;

async function loadDailyLog(): Promise<DailyLog> {
  const raw = await store.getItem(KEYS.DAILY_LOG);
  return raw ? (JSON.parse(raw) as DailyLog) : {};
}

/** A day record with every field defaulted, tolerant of logs from older builds. */
function emptyDay(partial?: Partial<DailyActivity>): DailyActivity {
  return { attempts: 0, unlocks: 0, blocks: 0, games: 0, ...partial };
}

/**
 * Record one day's activity locally. Keyed by date string so it is purely
 * device based (no account, no cloud). An 'attempt' is opening a blocked app; a
 * 'block'/'unlock' is the outcome of the quiz that opens. Trims anything older
 * than 30 days so the log cannot grow without bound.
 */
async function recordDailyActivity(kind: 'unlock' | 'block' | 'attempt'): Promise<void> {
  const log = await loadDailyLog();
  const key = new Date().toDateString();
  const day = emptyDay(log[key]);
  if (kind === 'attempt') {
    day.attempts += 1;
  } else {
    if (kind === 'unlock') day.unlocks += 1;
    else day.blocks += 1;
    day.games += 1;
  }
  log[key] = day;

  const cutoff = Date.now() - 30 * DAY_MS;
  for (const k of Object.keys(log)) {
    if (new Date(k).getTime() < cutoff) delete log[k];
  }
  await store.setItem(KEYS.DAILY_LOG, JSON.stringify(log));
}

/**
 * Record that the user opened an app Brainfuel blocks (a quiz launched from a
 * real Screen Time shield). Call this once per block, before the quiz outcome.
 */
export async function recordBlockAttempt(): Promise<void> {
  await recordDailyActivity('attempt');
}

/**
 * The last 7 days of real on-device activity, oldest first and ending today.
 * Drives the Stats chart. Days with no activity come back as zeroes.
 */
export async function getWeeklyActivity(): Promise<DayStat[]> {
  const log = await loadDailyLog();
  const days: DayStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY_MS);
    const day = emptyDay(log[date.toDateString()]);
    days.push({
      label: WEEKDAY_LETTERS[date.getDay()],
      attempts: day.attempts,
      minutes: day.unlocks * MINUTES_PER_UNLOCK,
      unlocks: day.unlocks,
      blocks: day.blocks,
    });
  }
  return days;
}

/**
 * Compares how often the user reached for a blocked app this week against the
 * previous week, the same week-over-week framing focus apps use (the true
 * "before Brainfuel" baseline does not exist, since Apple never shared it).
 */
export async function getActivityTrend(): Promise<ActivityTrend> {
  const log = await loadDailyLog();
  const sumAttempts = (startDaysAgo: number, endDaysAgo: number): number => {
    let total = 0;
    for (let i = startDaysAgo; i <= endDaysAgo; i++) {
      const date = new Date(Date.now() - i * DAY_MS);
      total += emptyDay(log[date.toDateString()]).attempts;
    }
    return total;
  };
  const thisWeek = sumAttempts(0, 6);
  const lastWeek = sumAttempts(7, 13);
  const percentChange =
    lastWeek === 0 ? null : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { thisWeek, lastWeek, percentChange };
}

/** Record a passed quiz: bumps unlocks, games played, and the daily log. */
export async function incrementUnlock(): Promise<void> {
  const s = await getSettings();
  await saveSettings({
    totalUnlocks: s.totalUnlocks + 1,
    gamesPlayed: s.gamesPlayed + 1,
  });
  await recordDailyActivity('unlock');
}

/** Record a failed quiz: bumps blocked attempts, games played, and the daily log. */
export async function incrementBlocked(): Promise<void> {
  const s = await getSettings();
  await saveSettings({
    totalBlocked: s.totalBlocked + 1,
    gamesPlayed: s.gamesPlayed + 1,
  });
  await recordDailyActivity('block');
}

// Economy helpers

/**
 * Pure function. Returns the player's level info based on accumulated XP.
 * Curve: 100 XP per level. Level 1 starts at 0 XP.
 *   level         = floor(xp / 100) + 1
 *   xpIntoLevel   = xp % 100
 *   xpForLevel    = 100  (constant; every level costs 100 XP)
 */
export function brainLevel(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  return {
    level: Math.floor(safeXp / 100) + 1,
    xpIntoLevel: safeXp % 100,
    xpForLevel: 100,
  };
}

/** Add n minutes to the bank. Clamps to zero minimum. */
export async function addMinutes(n: number): Promise<void> {
  const s = await getSettings();
  await saveSettings({ minutes: Math.max(0, s.minutes + n) });
}

/**
 * Spend n minutes from the bank.
 * Returns false without modifying anything if the balance is insufficient.
 * Returns true after deducting the minutes.
 */
export async function spendMinutes(n: number): Promise<boolean> {
  const s = await getSettings();
  if (s.minutes < n) return false;
  await saveSettings({ minutes: s.minutes - n });
  return true;
}

/** Add n Brain XP. Clamps to zero minimum. */
export async function addXp(n: number): Promise<void> {
  const s = await getSettings();
  await saveSettings({ xp: Math.max(0, s.xp + n) });
}

/** Mark a shop item as owned. No-op if already owned. */
export async function markItemOwned(id: string): Promise<void> {
  const s = await getSettings();
  if (s.owned.includes(id)) return;
  await saveSettings({ owned: [...s.owned, id] });
}

/** Returns true if the given shop item id is in the owned list. */
export async function isItemOwned(id: string): Promise<boolean> {
  const s = await getSettings();
  return s.owned.includes(id);
}

// First-launch detection

export async function isFirstLaunch(): Promise<boolean> {
  const raw = await store.getItem(KEYS.FIRST_LAUNCH);
  return raw === null;
}

export async function markFirstLaunchComplete(): Promise<void> {
  await store.setItem(KEYS.FIRST_LAUNCH, new Date().toISOString());
}

// Subscription status (raw persistence; business logic lives in subscription.ts)

export async function getPersistedSubscriptionStatus(): Promise<string | null> {
  return store.getItem(KEYS.SUBSCRIPTION_STATUS);
}

export async function setPersistedSubscriptionStatus(status: string): Promise<void> {
  await store.setItem(KEYS.SUBSCRIPTION_STATUS, status);
}

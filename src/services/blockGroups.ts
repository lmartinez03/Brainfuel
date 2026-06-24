// src/services/blockGroups.ts
//
// "Block groups": the data model for user-configured app blocking. iOS hides
// which apps a user picks (opaque tokens, no names), so instead of a per-app
// list we let users create named groups, each holding a Screen Time selection
// and ONE rule. One app per group gives effectively per-app control; the user
// supplies the name since iOS will not.
//
// Each group's `id` doubles as its familyActivitySelectionId (the key the
// native picker persists the chosen apps under). Enforcement lives in
// screenTimeBlocking.ts (applyBlockGroups); this file is just storage.

let AsyncStorage: {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
} | null = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const memory: Record<string, string> = {};
async function getItem(key: string): Promise<string | null> {
  if (AsyncStorage) return AsyncStorage.getItem(key);
  return memory[key] ?? null;
}
async function setItem(key: string, value: string): Promise<void> {
  if (AsyncStorage) return AsyncStorage.setItem(key, value);
  memory[key] = value;
}

const KEY = 'brainfuel:block_groups';

/** A group's blocking behaviour. Exactly one rule per group. */
export type BlockRule =
  | { type: 'always' }
  | { type: 'limit'; minutes: number }
  | {
      type: 'schedule';
      /** Weekdays the window applies to, 0 = Sunday through 6 = Saturday. */
      days: number[];
      /** Minutes past midnight for the start and end of the blocked window. */
      startMinutes: number;
      endMinutes: number;
    };

export interface BlockGroup {
  /** Stable id; also the familyActivitySelectionId for the picker selection. */
  id: string;
  name: string;
  /** Apps + categories picked, reported by the picker. iOS hides their names. */
  appCount: number;
  rule: BlockRule;
  /** When false, the group is saved but not enforced. */
  enabled: boolean;
}

/** A fresh, unique group id. Runs in the app, so Date.now is fine here. */
export function newGroupId(): string {
  return `grp_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export async function getBlockGroups(): Promise<BlockGroup[]> {
  try {
    const raw = await getItem(KEY);
    return raw ? (JSON.parse(raw) as BlockGroup[]) : [];
  } catch {
    return [];
  }
}

export async function saveBlockGroups(groups: BlockGroup[]): Promise<void> {
  await setItem(KEY, JSON.stringify(groups));
}

/** Insert or replace a group by id, preserving order. */
export async function upsertBlockGroup(group: BlockGroup): Promise<BlockGroup[]> {
  const groups = await getBlockGroups();
  const idx = groups.findIndex((g) => g.id === group.id);
  if (idx >= 0) groups[idx] = group;
  else groups.push(group);
  await saveBlockGroups(groups);
  return groups;
}

export async function removeBlockGroup(id: string): Promise<BlockGroup[]> {
  const groups = (await getBlockGroups()).filter((g) => g.id !== id);
  await saveBlockGroups(groups);
  return groups;
}

/** A short human label for a rule, used in the groups list. */
export function describeRule(rule: BlockRule): string {
  if (rule.type === 'always') return 'Always blocked';
  if (rule.type === 'limit') return `${rule.minutes} min/day, then blocked`;
  return `${formatDays(rule.days)} ${formatTime(rule.startMinutes)} to ${formatTime(rule.endMinutes)}`;
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function formatDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  if (days.length === 0) return 'No days';
  return [...days].sort((a, b) => a - b).map((d) => DAY_LETTERS[d]).join(' ');
}

export function formatTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')}${period}`;
}

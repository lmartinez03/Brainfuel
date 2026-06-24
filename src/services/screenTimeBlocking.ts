/**
 * Real app blocking via Apple's Screen Time / Family Controls API,
 * wrapped through react-native-device-activity.
 *
 * Unlike the Shortcuts approach (a soft interruption the user can swipe past),
 * this puts up a genuine shield the user cannot bypass. It is NATIVE, so it only
 * works in a development or EAS build on a physical device, never in Expo Go and
 * never on the simulator.
 *
 * Every call is guarded, so the rest of the app keeps running in Expo Go (where
 * isScreenTimeAvailable() returns false and these functions are no-ops). That
 * lets you keep demoing the games in Expo Go while you wait on Apple's
 * Family Controls entitlement approval.
 *
 * Build, entitlement, and testing steps live in docs/real-blocking-setup.md.
 *
 * NOTE: the native calls below follow react-native-device-activity's documented
 * API, but they cannot be run or verified on Windows / Expo Go. Confirm the exact
 * names and the re-block scheduling against the installed version's types the
 * first time you run a dev build (search for "VERIFY ON DEVICE" below).
 */
import { Platform } from 'react-native';
import { BlockGroup, getBlockGroups } from './blockGroups';

// Present in a dev / EAS build; throws or is absent in Expo Go. The try/catch
// keeps Expo Go from crashing at import time.
let DeviceActivity: any = null;
try {
  DeviceActivity = require('react-native-device-activity');
} catch {
  DeviceActivity = null;
}

/** Name of the one-shot DeviceActivity schedule that re-applies the shield when
 *  a temporary unlock window ends. Kept separate so we can cancel it on demand. */
const REBLOCK_ACTIVITY = 'brainfuel.reblock';

/** Prefix for the DeviceActivity monitors that enforce each block group. */
const GROUP_ACTIVITY_PREFIX = 'brainfuel.group';

/** The lock screen (shield) look and text. The subtitle doubles as a fallback
 *  instruction: iOS 16+ blocks Screen Time extensions from launching the host
 *  app reliably, so if the button cannot open Brainfuel, opening it from the
 *  home screen still drops the user into the quiz (the app routes there while a
 *  block is active). */
const SHIELD = {
  title: 'Locked by Brainfuel',
  subtitle:
    'Tap below and open the notification, or open the Brainfuel app, to take a quiz and unlock 15 minutes.',
  primaryButtonLabel: 'Unlock with a quiz',
  secondaryButtonLabel: 'Not now',
};

/**
 * What the shield buttons do. iOS 16+ forbids a shield extension from launching
 * the host app, so the primary button posts a notification the user taps to
 * reach the quiz (see the inline note). Applied at runtime via updateShield, so
 * changes take effect on reload with no native rebuild (but the notification
 * itself needs the expo-notifications build for permission).
 */
const SHIELD_ACTIONS = {
  // iOS 16+ forbids a shield extension from launching the app directly, so the
  // primary button instead posts an immediate, Time-Sensitive notification the
  // user taps to open straight to the quiz (the app routes there on foreground
  // while a block is active). `defer` keeps the shield up so the banner appears
  // over it. The notification only shows if the app has notification permission
  // (requested via ensureNotificationPermission when blocking is set up).
  primary: {
    type: 'sendNotification',
    payload: {
      title: 'Brainfuel',
      body: 'Tap to take your quiz and unlock 15 minutes.',
      sound: 'default',
      interruptionLevel: 'timeSensitive',
    },
    behavior: 'defer',
  },
  secondary: { behavior: 'close' },
};

/**
 * True only inside a native build where the Screen Time module is linked.
 * Use this to show or hide the real-blocking UI and to fall back to the
 * Shortcuts flow elsewhere.
 */
export function isScreenTimeAvailable(): boolean {
  return (
    Platform.OS === 'ios' &&
    DeviceActivity != null &&
    typeof DeviceActivity.requestAuthorization === 'function'
  );
}

/**
 * True only when the user has actually approved Screen Time access. iOS reports
 * status 2 = approved. Use this to gate the blocking UI; `requestAuthorization`
 * resolving does NOT mean the user said yes.
 */
export function isScreenTimeAuthorized(): boolean {
  if (!isScreenTimeAvailable()) return false;
  try {
    return DeviceActivity.getAuthorizationStatus() === 2;
  } catch {
    return false;
  }
}

/**
 * Ask the user to grant Screen Time permission. iOS shows the system prompt.
 * Returns the real result (true only if the user approved).
 *
 * getAuthorizationStatus can briefly report "not determined" right after the
 * prompt (a documented delay), so we poll for a couple of seconds until it
 * settles on approved (2) or denied (1) before answering.
 */
export async function requestScreenTimeAuthorization(): Promise<boolean> {
  if (!isScreenTimeAvailable()) return false;
  try {
    await DeviceActivity.requestAuthorization();
  } catch {
    // ignore; poll the resulting status below
  }
  for (let i = 0; i < 8; i++) {
    if (isScreenTimeAuthorized()) return true;
    try {
      if (DeviceActivity.getAuthorizationStatus() === 1) return false; // denied, settled
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return isScreenTimeAuthorized();
}

// Block groups.
//
// Each group is enforced by its own DeviceActivity monitor(s) plus configured
// actions that the native ActivityMonitor extension runs even when Brainfuel is
// closed. The whole config is re-applied on launch and whenever groups change.
//
// VERIFY ON DEVICE: the schedule/threshold shapes and the blockSelection /
// unblockSelection action wiring follow the library's documented types but
// cannot be tested off-device. Confirm intervals fire and the right group's
// apps shield/unshield on the first dev build.

/** All monitor names a group might use (one base, plus one per weekday). */
function groupMonitorNames(group: BlockGroup): string[] {
  const base = `${GROUP_ACTIVITY_PREFIX}.${group.id}`;
  const names = [base];
  for (let d = 0; d < 7; d++) names.push(`${base}.d${d}`);
  return names;
}

/** Stop a group's monitors and lift its shield. */
function clearGroupNative(group: BlockGroup): void {
  try {
    DeviceActivity.stopMonitoring(groupMonitorNames(group));
  } catch {
    // nothing was scheduled
  }
  try {
    DeviceActivity.unblockSelection({ activitySelectionId: group.id });
  } catch {
    // not currently blocked
  }
}

/** Run a native call, swallowing any error so one bad call cannot abort the rest. */
function safe(fn: () => void): void {
  try {
    fn();
  } catch {
    // ignore; a single failed native call should never crash the app
  }
}

/** Apply one group's rule: always block, daily usage limit, or a schedule. */
function applyOneGroup(group: BlockGroup): void {
  // Start from a clean slate so changing a rule never leaves stale monitors.
  clearGroupNative(group);
  if (!group.enabled || group.appCount === 0) return;

  const base = `${GROUP_ACTIVITY_PREFIX}.${group.id}`;
  const rule = group.rule;

  if (rule.type === 'always') {
    safe(() => DeviceActivity.blockSelection({ activitySelectionId: group.id }));
    return;
  }

  if (rule.type === 'limit') {
    // A usage-threshold event needs the SERIALIZED selection, not the id, so
    // resolve it from what the picker persisted. Without it we cannot monitor
    // usage, so skip rather than pass a bad argument.
    let selection: string | undefined;
    try {
      selection = DeviceActivity.getFamilyActivitySelectionId(group.id);
    } catch {
      selection = undefined;
    }
    if (!selection) return;

    const minutes = Math.max(1, Math.floor(rule.minutes));
    safe(() =>
      DeviceActivity.configureActions({
        activityName: base,
        callbackName: 'eventDidReachThreshold',
        actions: [{ type: 'blockSelection', familyActivitySelectionId: group.id }],
      }),
    );
    safe(() =>
      DeviceActivity.configureActions({
        activityName: base,
        callbackName: 'intervalDidStart',
        actions: [{ type: 'unblockSelection', familyActivitySelectionId: group.id }],
      }),
    );
    safe(() =>
      DeviceActivity.startMonitoring(
        base,
        { intervalStart: { hour: 0, minute: 0 }, intervalEnd: { hour: 23, minute: 59 }, repeats: true },
        [
          {
            eventName: 'limit',
            familyActivitySelection: selection,
            threshold: { hour: Math.floor(minutes / 60), minute: minutes % 60 },
          },
        ],
      ),
    );
    return;
  }

  // schedule: one weekly-repeating monitor per selected day, blocking for the
  // window and unblocking at its end. DateComponents weekday is 1=Sun..7=Sat.
  for (const day of rule.days) {
    const name = `${base}.d${day}`;
    safe(() =>
      DeviceActivity.configureActions({
        activityName: name,
        callbackName: 'intervalDidStart',
        actions: [{ type: 'blockSelection', familyActivitySelectionId: group.id }],
      }),
    );
    safe(() =>
      DeviceActivity.configureActions({
        activityName: name,
        callbackName: 'intervalDidEnd',
        actions: [{ type: 'unblockSelection', familyActivitySelectionId: group.id }],
      }),
    );
    safe(() =>
      DeviceActivity.startMonitoring(
        name,
        {
          intervalStart: {
            weekday: day + 1,
            hour: Math.floor(rule.startMinutes / 60),
            minute: rule.startMinutes % 60,
          },
          intervalEnd: {
            weekday: day + 1,
            hour: Math.floor(rule.endMinutes / 60),
            minute: rule.endMinutes % 60,
          },
          repeats: true,
        },
        [],
      ),
    );
  }
}

/**
 * Apply every group's rule. Safe to call repeatedly (each group is cleared
 * first), so call it on launch and after any change to the groups.
 */
export async function applyBlockGroups(groups?: BlockGroup[]): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  try {
    const list = groups ?? (await getBlockGroups());
    DeviceActivity.updateShield(SHIELD, SHIELD_ACTIONS);
    for (const group of list) applyOneGroup(group);
  } catch {
    // no-op
  }
}

/** Stop all group enforcement and lift every shield (the panic switch). */
export async function clearAllBlockGroups(): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  try {
    const list = await getBlockGroups();
    for (const group of list) clearGroupNative(group);
    DeviceActivity.stopMonitoring([REBLOCK_ACTIVITY]);
    DeviceActivity.resetBlocks();
  } catch {
    // no-op
  }
}

/**
 * Re-write the shield button config to the latest SHIELD_ACTIONS without
 * touching what is blocked. Call this on app launch so a changed shield config
 * takes effect after a JS reload, instead of only when the user re-blocks.
 */
export function refreshShieldConfig(): void {
  if (!isScreenTimeAvailable()) return;
  try {
    DeviceActivity.updateShield(SHIELD, SHIELD_ACTIONS);
  } catch {
    // no-op
  }
}

/** True if the shield is currently active (an app is blocked right now). */
export function isBlockingActive(): boolean {
  if (!isScreenTimeAvailable()) return false;
  try {
    return DeviceActivity.isShieldActive() === true;
  } catch {
    return false;
  }
}

// When the quiz screen is open we don't want the root layout pushing it again
// as the app foregrounds, so it reports its visibility here.
let quizVisibleFlag = false;
export function setQuizVisible(visible: boolean): void {
  quizVisibleFlag = visible;
}
export function isQuizVisible(): boolean {
  return quizVisibleFlag;
}

/**
 * Grant a temporary access window after a passed quiz, then automatically
 * re-shield the apps when it ends.
 *
 * Flow:
 *   1. Lift the shield now so the chosen apps open.
 *   2. Schedule a one-shot DeviceActivity interval that ends in `minutes`. The
 *      re-block action is configured natively, so the ActivityMonitor extension
 *      re-applies the shield even if Brainfuel is closed.
 *
 * iOS requires a DeviceActivity interval to be at least 15 minutes, which is
 * exactly our default unlock window.
 *
 * VERIFY ON DEVICE: confirm on the first dev build that the interval fires
 * intervalDidEnd and the configured blockSelection re-shields each group.
 */
export async function unlockForMinutes(minutes = 15): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  try {
    // Lift each shield explicitly. resetBlocks() clears only the default store
    // and does NOT remove a per-selection blockSelection shield, so unblock every
    // group by id; resetBlocks() is a final catch-all.
    const groups = await getBlockGroups();
    for (const group of groups) {
      safe(() => DeviceActivity.unblockSelection({ activitySelectionId: group.id }));
    }
    DeviceActivity.resetBlocks();
    await scheduleReblock(minutes);
  } catch {
    // no-op
  }
}

/**
 * Arms the native re-block. After `minutes`, re-shields every enabled block
 * group, so a passed quiz grants a temporary window across whatever was
 * blocking the user. Any earlier pending re-block is cleared first so windows
 * never stack.
 *
 * Note: this re-blocks all enabled groups, which can re-shield a schedule or
 * limit group slightly outside its window. For a focus app, erring toward
 * blocking is the safe default; refine per-group timing once verified on device.
 */
async function scheduleReblock(minutes: number): Promise<void> {
  try {
    DeviceActivity.stopMonitoring([REBLOCK_ACTIVITY]);
  } catch {
    // nothing was scheduled yet
  }

  const groups = (await getBlockGroups()).filter((g) => g.enabled && g.appCount > 0);
  if (groups.length === 0) return;

  const now = new Date();
  const end = new Date(now.getTime() + minutes * 60_000);

  DeviceActivity.configureActions({
    activityName: REBLOCK_ACTIVITY,
    callbackName: 'intervalDidEnd',
    actions: groups.map((g) => ({
      type: 'blockSelection',
      familyActivitySelectionId: g.id,
    })),
  });

  DeviceActivity.startMonitoring(
    REBLOCK_ACTIVITY,
    {
      intervalStart: {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      },
      intervalEnd: {
        hour: end.getHours(),
        minute: end.getMinutes(),
        second: end.getSeconds(),
      },
      repeats: false,
    },
    [],
  );
}

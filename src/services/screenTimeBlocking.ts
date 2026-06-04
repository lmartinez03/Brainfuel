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

// Present in a dev / EAS build; throws or is absent in Expo Go. The try/catch
// keeps Expo Go from crashing at import time.
let DeviceActivity: any = null;
try {
  DeviceActivity = require('react-native-device-activity');
} catch {
  DeviceActivity = null;
}

/** Names shared between this module and the native extensions. */
const ACTIVITY_NAME = 'brainfuel.block';
/** Ties the picker selection to the block calls. The picker view persists the
 *  chosen apps under this id (familyActivitySelectionId). */
export const SELECTION_ID = 'brainfuel.selection';

/** The shield text shown on a blocked app. */
const SHIELD = {
  title: 'Locked by Brainfuel',
  subtitle: 'Open Brainfuel and pass a quiz to unlock 15 minutes.',
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
 * Ask the user to grant Screen Time permission. iOS shows the system prompt.
 * Returns true if authorization succeeded.
 */
export async function requestScreenTimeAuthorization(): Promise<boolean> {
  if (!isScreenTimeAvailable()) return false;
  try {
    await DeviceActivity.requestAuthorization();
    return true;
  } catch {
    return false;
  }
}

/**
 * Shield the apps the user selected in the picker. Call this after they pick
 * apps (the picker persists the selection under SELECTION_ID).
 */
export async function blockSelectedApps(): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  await DeviceActivity.updateShield(SHIELD, { primary: { behavior: 'close' } });
  await DeviceActivity.blockSelection({ activitySelectionId: SELECTION_ID });
}

/** Remove the shield from all apps (user turned blocking off entirely). */
export async function unblockAllApps(): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  try {
    await DeviceActivity.stopMonitoring(ACTIVITY_NAME);
    // VERIFY ON DEVICE: confirm the exact "clear shield" call in the installed
    // version (e.g. unblockSelection / disableBlockAllMode) and call it here.
  } catch {
    // no-op
  }
}

/**
 * Grant a temporary access window after a passed quiz, then automatically
 * re-shield the apps. The re-block must be scheduled NATIVELY so it fires even
 * if Brainfuel is closed.
 *
 * Intended flow:
 *   1. Lift the shield now (unblock the selection).
 *   2. startMonitoring with a `minutes`-long interval, and configureActions so
 *      that on interval end the native extension re-applies blockSelection.
 *
 * VERIFY ON DEVICE: the scheduling API (startMonitoring schedule shape +
 * configureActions callbackName) is the one piece to confirm against the
 * installed library when you run the first dev build.
 */
export async function unlockForMinutes(minutes = 15): Promise<void> {
  if (!isScreenTimeAvailable()) return;
  try {
    await DeviceActivity.stopMonitoring(ACTIVITY_NAME);
    await DeviceActivity.configureActions({
      activityName: ACTIVITY_NAME,
      callbackName: 'intervalDidEnd',
      actions: [{ type: 'blockSelection', familyActivitySelectionId: SELECTION_ID }],
    });
    await DeviceActivity.startMonitoring(
      ACTIVITY_NAME,
      { intervalStart: { minute: 0 }, intervalEnd: { minute: minutes }, repeats: false },
      [],
    );
  } catch {
    // no-op until verified on a dev build
  }
}

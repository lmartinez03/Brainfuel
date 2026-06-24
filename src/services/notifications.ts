// src/services/notifications.ts
//
// Local-notification permission + a test sender, used for the Screen Time
// shield's unlock flow. iOS 16+ blocks a shield extension from launching the
// app directly, so the shield posts a tappable notification ("Tap to take your
// quiz") instead. That notification only shows if the app has notification
// permission, which we request here. The shield extension posts its own
// notification natively; expo-notifications is only for the app-side permission
// and the in-app test.

let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

// Show notifications even while Brainfuel is foregrounded (so the test below is
// visible). The shield's notification fires while the app is backgrounded, where
// this handler does not apply, but setting it does no harm there.
try {
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // Older SDK field, harmless if ignored.
      shouldShowAlert: true,
    }),
  } as any);
} catch {
  // handler is best-effort
}

/**
 * Subscribe to notification taps. The handler runs when the user taps a
 * Brainfuel notification, which in practice is the shield's "unlock with a quiz"
 * prompt. Returns an unsubscribe function. No-op when expo-notifications is
 * unavailable (Expo Go / web / tests).
 */
export function addNotificationTapListener(handler: () => void): () => void {
  if (!Notifications) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener(() => handler());
  return () => sub.remove();
}

/**
 * Ensure notification permission, prompting once if it has not been decided.
 * Returns true if granted. Safe to call repeatedly; iOS only prompts once.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return requested.granted;
  } catch {
    return false;
  }
}

/** Whether notification permission is currently granted, without prompting. */
export async function getNotificationStatus(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    return current.granted;
  } catch {
    return false;
  }
}

/**
 * Post an immediate local notification to confirm notifications work on this
 * device. Returns false if not permitted (so the UI can guide the user to
 * Settings). Used by the "Test notification" button.
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!Notifications) return false;
  const ok = await ensureNotificationPermission();
  if (!ok) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Brainfuel',
        body: 'Notifications are working. This is what the unlock prompt looks like.',
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}

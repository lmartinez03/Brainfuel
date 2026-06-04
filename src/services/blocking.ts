/**
 * Blocking service: the "one sec"-style interruption flow for Brainfuel.
 *
 * ============================================================
 * HOW THE FLOW WORKS (iOS Shortcuts + Deep Linking)
 * ============================================================
 *
 * iOS does NOT allow one app to programmatically block another. Instead, we
 * replicate the "one sec" approach using the iOS Shortcuts app's Personal
 * Automation feature:
 *
 *   1. User creates a Personal Automation in iOS Shortcuts:
 *      TRIGGER: "When I open Instagram"
 *      ACTION:  Open URL, set to: brainfuel://block?app=instagram
 *
 *   2. Every time the user opens Instagram, iOS Shortcuts fires first and
 *      launches Brainfuel via the deep link.
 *
 *   3. Brainfuel's root layout (app/_layout.tsx) listens for incoming URLs
 *      via expo-linking's `useURL()` hook and calls handleIncomingBlock(url).
 *
 *   4. handleIncomingBlock() parses the URL, checks if the app is already in
 *      its 15-minute unlock window (isUnlocked), and either:
 *        a) Immediately deep-links back to the target app (still unlocked), or
 *        b) Navigates to the quiz screen, passing the target appId as a param.
 *
 *   5. On quiz success the UI calls unlockApp(appId), which:
 *        - Persists a 15-minute unlock window in storage.
 *        - Deep-links back to the target app's URL scheme.
 *        - Increments the totalUnlocks stat.
 *
 *   6. On quiz failure the UI calls denyAccess(appId), which:
 *        - Increments the totalBlocked stat.
 *        - Does NOT open the target app.
 *        - Shows an in-app "access denied" message.
 *
 * EXPO GO COMPATIBILITY:
 *   Deep linking works in Expo Go via the `exp://` scheme in development and
 *   the custom `brainfuel://` scheme in standalone builds. The app.json has
 *   `"scheme": "brainfuel"` configured. The LSApplicationQueriesSchemes list
 *   in infoPlist allows canOpenURL() to query the blocked apps' schemes.
 *
 * LIMITATIONS:
 *   - The Shortcuts automation opens Brainfuel every time the user taps
 *     Instagram. If the 15-minute window is active, Brainfuel immediately
 *     bounces back; the experience is near-instantaneous.
 *   - Android uses a similar flow via the Tasker app (documented in
 *     the onboarding instructions screen).
 * ============================================================
 */

import * as Linking from 'expo-linking';
import {
  isAppUnlocked,
  recordUnlockWindow,
  incrementUnlock,
  incrementBlocked,
  getBlockedApps,
  setBlockedApps,
  getCustomApps,
} from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockPayload {
  /** Normalised app identifier, e.g. "instagram". */
  appId: string;
  /**
   * Optional custom URL scheme to open on success.
   * If not provided, APP_SCHEMES[appId] is used as a fallback.
   */
  customScheme?: string;
}

export interface BlockResult {
  /** Whether access was already unlocked (no quiz needed). */
  alreadyUnlocked: boolean;
  /** The app ID that was evaluated. */
  appId: string;
  /** Expiry timestamp (ms) of the active unlock window, if any. */
  expiresAt?: number;
}

// ---------------------------------------------------------------------------
// Known URL schemes for popular blockable apps
// ---------------------------------------------------------------------------

/**
 * Maps normalised app IDs to their iOS URL schemes.
 *
 * Sources:
 * - https://github.com/Tanaschita/ios-known-url-schemes-and-universal-links
 * - Official developer documentation for each app
 * - Community-verified schemes
 *
 * NOTE: Instagram, TikTok, Snapchat, YouTube, Facebook, and Reddit open their
 * app homepage when the bare scheme:// is launched. Twitter/X uses twitter://
 * for backward compatibility. Threads uses the "barcelona" internal scheme.
 *
 * IMPORTANT: All schemes must also be listed in app.json under
 * ios.infoPlist.LSApplicationQueriesSchemes for canOpenURL() to work on iOS 9+.
 */
export const APP_SCHEMES: Record<string, string> = {
  // Social
  instagram: 'instagram://',
  tiktok: 'tiktok://',
  snapchat: 'snapchat://',
  threads: 'barcelona://',
  pinterest: 'pinterest://',
  tumblr: 'tumblr://',

  // Video
  youtube: 'youtube://',
  twitch: 'twitch://',
  netflix: 'nflx://',
  hulu: 'hulu://',
  disneyplus: 'disneyplus://',

  // Social media / news
  twitter: 'twitter://',
  x: 'twitter://',          // X (formerly Twitter) still uses twitter://
  facebook: 'fb://',
  reddit: 'reddit://',
  mastodon: 'mastodon://',

  // Messaging (users may want to block these during focus time)
  discord: 'discord://',
  telegram: 'tg://',
  whatsapp: 'whatsapp://',

  // Music / audio
  spotify: 'spotify://',
  soundcloud: 'soundcloud://',

  // Gaming
  twitch_studio: 'twitch://',
  roblox: 'roblox://',
  steam: 'steam://',

  // Shopping (dopamine loop apps)
  amazon: 'com.amazon.mobile.shopping://',
  ebay: 'ebay://',
  etsy: 'etsy://',
};

/**
 * Human-readable display names for the app picker in settings.
 */
export const APP_DISPLAY_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  threads: 'Threads',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
  twitch: 'Twitch',
  netflix: 'Netflix',
  twitter: 'Twitter / X',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  reddit: 'Reddit',
  discord: 'Discord',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  spotify: 'Spotify',
  roblox: 'Roblox',
};

/** Returns all apps that have known URL schemes, sorted alphabetically. */
export function getKnownBlockableApps(): Array<{ id: string; displayName: string }> {
  const ids = Object.keys(APP_DISPLAY_NAMES).sort();
  return ids.map((id) => ({ id, displayName: APP_DISPLAY_NAMES[id] ?? id }));
}

// ---------------------------------------------------------------------------
// Deep-link parsing
// ---------------------------------------------------------------------------

/**
 * Parses an incoming brainfuel:// URL and extracts the block payload.
 *
 * Expected URL format: brainfuel://block?app=<appId>
 *
 * Returns null if the URL is not a valid block deep link.
 */
export function parseBlockDeepLink(url: string): BlockPayload | null {
  try {
    const parsed = Linking.parse(url);

    // Must match the brainfuel:// scheme and the /block path
    if (parsed.scheme !== 'brainfuel') return null;
    if (parsed.path !== 'block' && parsed.path !== '/block') return null;

    const appId = parsed.queryParams?.app;
    if (!appId || typeof appId !== 'string') return null;

    const customScheme = parsed.queryParams?.scheme as string | undefined;

    return {
      appId: appId.toLowerCase().trim(),
      customScheme,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core blocking flow
// ---------------------------------------------------------------------------

/**
 * Entry point for the "one sec" blocking flow.
 *
 * Called by the app's root layout whenever a new URL is received via
 * expo-linking's `useURL()` hook.
 *
 * Returns a BlockResult so the caller (UI layer) can decide whether to:
 *   - Show the quiz screen (alreadyUnlocked = false)
 *   - Immediately bounce back to the target app (alreadyUnlocked = true)
 *   - Show an error if the appId is not recognised / not in the blocked list
 *
 * Usage in app/_layout.tsx:
 *   const url = useURL();
 *   useEffect(() => {
 *     if (!url) return;
 *     handleIncomingBlock(url).then(result => {
 *       if (result === null) return; // not a block deep link
 *       if (result.alreadyUnlocked) {
 *         unlockApp(result.appId); // bounce back immediately
 *       } else {
 *         router.push({ pathname: '/quiz', params: { appId: result.appId } });
 *       }
 *     });
 *   }, [url]);
 */
export async function handleIncomingBlock(url: string): Promise<BlockResult | null> {
  const payload = parseBlockDeepLink(url);
  if (!payload) return null;

  const unlocked = await isAppUnlocked(payload.appId);

  if (unlocked) {
    // The 15-min window is still active; no quiz needed
    const expiryRaw = await import('./storage').then((m) => m.getUnlockExpiry(payload.appId));
    return {
      alreadyUnlocked: true,
      appId: payload.appId,
      expiresAt: expiryRaw ?? undefined,
    };
  }

  return {
    alreadyUnlocked: false,
    appId: payload.appId,
  };
}

// ---------------------------------------------------------------------------
// Post-quiz actions
// ---------------------------------------------------------------------------

/**
 * Call this after a SUCCESSFUL quiz to grant 15 minutes of access.
 *
 * Steps:
 *   1. Persists an unlock window in AsyncStorage.
 *   2. Increments the totalUnlocks stat.
 *   3. Attempts to open the target app via its URL scheme.
 *   4. Returns true if the app was opened, false if canOpenURL failed
 *      (app not installed, or scheme not in LSApplicationQueriesSchemes).
 */
export async function unlockApp(
  appId: string,
  customScheme?: string,
): Promise<{ opened: boolean; scheme: string }> {
  // 1. Persist unlock window (15 minutes)
  await recordUnlockWindow(appId);

  // 2. Update stats
  await incrementUnlock();

  // 3. Determine the URL scheme to open
  // Prefer an explicit scheme, then the built-in map, then a scheme the user
  // saved with their custom app, and finally a best-guess "<appId>://".
  let scheme: string | undefined = customScheme ?? APP_SCHEMES[appId];
  if (!scheme) {
    const custom = await getCustomApps();
    scheme = custom.find((a) => a.id === appId)?.scheme;
  }
  if (!scheme) scheme = `${appId}://`;

  // 4. Attempt to open the app
  try {
    const canOpen = await Linking.canOpenURL(scheme);
    if (canOpen) {
      await Linking.openURL(scheme);
      return { opened: true, scheme };
    }
  } catch {
    // canOpenURL or openURL can throw in some environments (e.g. Expo Go web)
  }

  return { opened: false, scheme };
}

/**
 * Call this after a FAILED quiz to record the denial.
 *
 * Does NOT grant access. The UI should show an "access denied" state.
 */
export async function denyAccess(appId: string): Promise<void> {
  await incrementBlocked();
}

// ---------------------------------------------------------------------------
// Unlock status query
// ---------------------------------------------------------------------------

/**
 * Returns true if the given app currently has an active unlock window.
 * Used by the UI to show/hide the "currently unlocked" badge in settings.
 */
export async function isUnlocked(appId: string): Promise<boolean> {
  return isAppUnlocked(appId);
}

// ---------------------------------------------------------------------------
// Blocked apps list management (re-exported from storage for convenience)
// ---------------------------------------------------------------------------

export { getBlockedApps, setBlockedApps };

/**
 * Generates the iOS Shortcuts deep-link URL for a given app.
 * This is the URL the user pastes into their Shortcut's "Open URL" action.
 *
 * Example output: brainfuel://block?app=instagram
 */
export function generateShortcutURL(appId: string): string {
  return `brainfuel://block?app=${encodeURIComponent(appId)}`;
}

/**
 * Generates the full step-by-step instructions users paste into iOS Shortcuts.
 * Returns a structured object for the onboarding screen to render.
 */
export function getShortcutInstructions(appId: string): {
  title: string;
  steps: string[];
  deepLinkURL: string;
} {
  const displayName = APP_DISPLAY_NAMES[appId] ?? appId;
  return {
    title: `Block ${displayName} with Brainfuel`,
    deepLinkURL: generateShortcutURL(appId),
    steps: [
      `Open the Shortcuts app on your iPhone.`,
      `Tap the Automation tab at the bottom.`,
      `Tap the + button (top right) → "New Automation".`,
      `Scroll down and tap "App" under Personal Automations.`,
      `Tap "Choose" and search for ${displayName}. Select it.`,
      `Make sure "Is Opened" is selected, then tap Next.`,
      `Tap "Add Action" → search for "Open URL" → select it.`,
      `Tap the URL field and enter: ${generateShortcutURL(appId)}`,
      `Tap Next → turn OFF "Ask Before Running" → tap Done.`,
      `Now every time you open ${displayName}, Brainfuel will intercept it!`,
    ],
  };
}

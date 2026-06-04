/**
 * Firestore data layer (STUB).
 *
 * ============================================================
 * IMPLEMENTATION STATUS: STUB / SCAFFOLDING
 * ============================================================
 * This file defines the Firestore data model and function signatures
 * that the billing sprint will implement. All functions currently return
 * mock data or no-op gracefully so the rest of the app compiles and runs.
 *
 * TODO (billing / analytics sprint):
 *   1. Install firebase: npx expo install firebase
 *   2. Create a Firebase project and add google-services.json / GoogleService-Info.plist
 *   3. Replace stub implementations with real Firestore calls.
 *   4. Add Firestore security rules (users can only read/write their own docs).
 *   5. Set up Cloud Functions for:
 *      - StoreKit webhook: update user subscription status in Firestore
 *      - Daily streak reminder push notification
 * ============================================================
 *
 * FIRESTORE DATA MODEL
 * ──────────────────────────────────────────────────────────
 *
 * /users/{uid}
 *   uid:              string           (matches Auth UID)
 *   email:            string
 *   createdAt:        Timestamp
 *   subscription: {
 *     status:         'trial' | 'active' | 'cancelled' | 'expired'
 *     planId:         string | null    (product ID)
 *     trialStartedAt: Timestamp
 *     currentPeriodEnd: Timestamp | null
 *     willRenew:      boolean
 *   }
 *   stats: {
 *     totalUnlocks:   number
 *     totalBlocked:   number
 *     streak:         number
 *     lastPlayDate:   string | null    (ISO date)
 *   }
 *   settings: {
 *     blockedApps:    string[]
 *     gameCategory:   string
 *     questionCount:  1 | 3 | 5
 *   }
 *
 * /users/{uid}/quizSessions/{sessionId}
 *   startedAt:        Timestamp
 *   category:         string
 *   questionCount:    number
 *   correctAnswers:   number
 *   passed:           boolean
 *   appId:            string           (which app triggered the quiz)
 *   durationMs:       number
 * ──────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------------
// Types (mirrored from data model above)
// ---------------------------------------------------------------------------

export interface FirestoreUser {
  uid: string;
  email: string;
  createdAt: Date;
  subscription: {
    status: 'trial' | 'active' | 'cancelled' | 'expired';
    planId: string | null;
    trialStartedAt: Date | null;
    currentPeriodEnd: Date | null;
    willRenew: boolean;
  };
  stats: {
    totalUnlocks: number;
    totalBlocked: number;
    streak: number;
    lastPlayDate: string | null;
  };
  settings: {
    blockedApps: string[];
    gameCategory: string;
    questionCount: 1 | 3 | 5;
  };
}

export interface QuizSession {
  sessionId?: string; // Set by Firestore after write
  startedAt: Date;
  category: string;
  questionCount: number;
  correctAnswers: number;
  passed: boolean;
  appId: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Firestore initialisation (stub)
// ---------------------------------------------------------------------------

/**
 * TODO: Replace with real Firebase initialisation.
 *
 * import { initializeApp, getApps } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 *
 * const firebaseConfig = {
 *   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
 *   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
 *   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
 *   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
 *   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 *   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
 * };
 *
 * const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
 * export const db = getFirestore(app);
 */

// TODO: replace with real Firestore instance in billing sprint

// ---------------------------------------------------------------------------
// User document
// ---------------------------------------------------------------------------

/**
 * Creates or updates the user document in Firestore.
 * Called after sign-in / sign-up.
 *
 * TODO: implement with:
 *   import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
 *   await setDoc(doc(db, 'users', uid), userData, { merge: true });
 */
export async function upsertUser(uid: string, data: Partial<FirestoreUser>): Promise<void> {
  // TODO: implement
  console.log('[Firestore STUB] upsertUser:', uid, data);
}

/**
 * Fetches the user document from Firestore.
 *
 * TODO: implement with:
 *   import { doc, getDoc } from 'firebase/firestore';
 *   const snap = await getDoc(doc(db, 'users', uid));
 *   return snap.exists() ? (snap.data() as FirestoreUser) : null;
 */
export async function getUser(uid: string): Promise<FirestoreUser | null> {
  // TODO: implement
  console.log('[Firestore STUB] getUser:', uid);
  return null;
}

/**
 * Updates only the subscription sub-document for a user.
 * Called from the subscription webhook / post-purchase flow.
 *
 * TODO: implement with:
 *   await updateDoc(doc(db, 'users', uid), { 'subscription': subscriptionData });
 */
export async function updateSubscription(
  uid: string,
  subscription: FirestoreUser['subscription'],
): Promise<void> {
  // TODO: implement
  console.log('[Firestore STUB] updateSubscription:', uid, subscription);
}

// ---------------------------------------------------------------------------
// Stats sync
// ---------------------------------------------------------------------------

/**
 * Syncs local stats to Firestore (called on quiz completion).
 * This allows cross-device leaderboards / analytics in the future.
 *
 * TODO: implement with Firestore increment:
 *   import { doc, updateDoc, increment } from 'firebase/firestore';
 *   await updateDoc(doc(db, 'users', uid), {
 *     'stats.totalUnlocks': increment(unlockDelta),
 *     'stats.streak': newStreak,
 *     'stats.lastPlayDate': today,
 *   });
 */
export async function syncStats(
  uid: string,
  stats: Partial<FirestoreUser['stats']>,
): Promise<void> {
  // TODO: implement
  console.log('[Firestore STUB] syncStats:', uid, stats);
}

// ---------------------------------------------------------------------------
// Quiz session logging
// ---------------------------------------------------------------------------

/**
 * Writes a quiz session record to Firestore for analytics.
 * Used to track category popularity, pass rates, and average duration.
 *
 * TODO: implement with:
 *   import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
 *   const ref = collection(db, 'users', uid, 'quizSessions');
 *   await addDoc(ref, { ...session, startedAt: serverTimestamp() });
 */
export async function logQuizSession(uid: string, session: QuizSession): Promise<void> {
  // TODO: implement
  console.log('[Firestore STUB] logQuizSession:', uid, session);
}

// ---------------------------------------------------------------------------
// Settings sync (optional, local-first; Firestore as backup)
// ---------------------------------------------------------------------------

/**
 * Persists user settings to Firestore so they can be restored on new devices.
 * This is best-effort: local AsyncStorage is always the source of truth.
 *
 * TODO: implement with Firestore merge write.
 */
export async function syncSettings(
  uid: string,
  settings: FirestoreUser['settings'],
): Promise<void> {
  // TODO: implement
  console.log('[Firestore STUB] syncSettings:', uid, settings);
}

/**
 * Loads settings from Firestore (called when restoring on a new device).
 * Returns null if no Firestore record exists; app falls back to local defaults.
 *
 * TODO: implement.
 */
export async function loadSettingsFromFirestore(
  uid: string,
): Promise<FirestoreUser['settings'] | null> {
  // TODO: implement
  console.log('[Firestore STUB] loadSettingsFromFirestore:', uid);
  return null;
}

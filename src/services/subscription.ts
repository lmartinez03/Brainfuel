/**
 * Subscription service: 3-day free trial and Apple StoreKit stubs.
 *
 * ============================================================
 * IMPLEMENTATION STATUS
 * ============================================================
 * This module provides the shape and stub implementations needed by the rest
 * of the app. The real billing logic (StoreKit receipt validation, Firestore
 * subscription records, restore flow) will be implemented in the billing sprint.
 *
 * TODO (billing sprint):
 *   - Integrate `expo-iap` or `react-native-purchases` (RevenueCat recommended)
 *     for cross-platform StoreKit / Google Play Billing.
 *   - Replace getSubscriptionStatus() with real receipt validation.
 *   - Add Firestore write on successful purchase (see firestore.ts).
 *   - Implement webhook handler (server-side) for subscription renewal events.
 *   - Add grace-period logic for failed renewals.
 * ============================================================
 *
 * PRODUCT IDs (create these in App Store Connect):
 *   brainfuel_pro_monthly  at $2.99/month
 *   brainfuel_pro_annual   at $19.99/year (~44% saving)
 *
 * TRIAL LOGIC:
 *   A 3-day free trial is offered on both plans. The trial start date is
 *   persisted in AsyncStorage (via storage.ts) so it survives app restarts
 *   even before a StoreKit receipt is available.
 * ============================================================
 */

import {
  getTrialStartedAt,
  setTrialStartedAt,
  getPersistedSubscriptionStatus,
  setPersistedSubscriptionStatus,
} from './storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export const PRODUCT_IDS = {
  monthly: 'brainfuel_pro_monthly',
  annual: 'brainfuel_pro_annual',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriptionStatusCode =
  | 'trial_active'    // within 3-day free trial
  | 'trial_expired'   // trial ended, not subscribed
  | 'subscribed'      // active paid subscription
  | 'cancelled'       // subscription cancelled (still has access until period end)
  | 'expired'         // subscription lapsed
  | 'unknown';        // initial state before any check

export interface SubscriptionStatus {
  /** Whether the user currently has full access (trial OR active subscription). */
  isActive: boolean;
  /** Whether the user is in their 3-day free trial period. */
  isTrialing: boolean;
  /** When the trial ends (null if not in trial or trial not started). */
  trialEndsAt: Date | null;
  /** Granular status code for analytics and UI display. */
  statusCode: SubscriptionStatusCode;
  /** The product ID the user is subscribed to (null if not subscribed). */
  planId: ProductId | null;
  /** Whether the subscription is set to auto-renew. */
  willRenew: boolean;
  /** When the current period ends (null if unknown). */
  currentPeriodEnd: Date | null;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  /**
   * The transaction ID from StoreKit if successful.
   * TODO: Use this to validate the receipt server-side.
   */
  transactionId?: string;
}

// ---------------------------------------------------------------------------
// Trial management
// ---------------------------------------------------------------------------

/**
 * Starts the 3-day free trial by recording the current timestamp.
 * No-ops if the trial has already been started.
 */
export async function startTrial(): Promise<void> {
  const existing = await getTrialStartedAt();
  if (existing !== null) return; // already started
  await setTrialStartedAt(Date.now());
}

/**
 * Returns whether the user is currently within their free trial window.
 */
export async function isInTrial(): Promise<boolean> {
  const startedAt = await getTrialStartedAt();
  if (startedAt === null) return false;
  return Date.now() < startedAt + TRIAL_DURATION_MS;
}

/**
 * Returns the Date when the trial ends, or null if the trial has not started
 * or has already expired.
 */
export async function getTrialEndDate(): Promise<Date | null> {
  const startedAt = await getTrialStartedAt();
  if (startedAt === null) return null;
  const endsAt = new Date(startedAt + TRIAL_DURATION_MS);
  if (Date.now() >= endsAt.getTime()) return null;
  return endsAt;
}

// ---------------------------------------------------------------------------
// Subscription status
// ---------------------------------------------------------------------------

/**
 * Returns the user's current subscription status.
 *
 * STUB BEHAVIOUR:
 *   - If the trial has been started and is still active: returns 'trial_active'
 *   - If the trial has expired and no subscription: returns 'trial_expired'
 *   - If the trial has not been started yet: starts it and returns 'trial_active'
 *   - 'subscribed' is only returned if a real StoreKit receipt is validated
 *     (TODO: billing sprint)
 *
 * The UI should call this on every app launch and on foreground transitions.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  // TODO (billing sprint): Check StoreKit receipt / RevenueCat entitlements first.
  //   const rcStatus = await Purchases.getCustomerInfo();
  //   if (rcStatus.entitlements.active['pro']) { ... }

  // Check persisted override (e.g. set after a successful purchase in this session)
  const persisted = await getPersistedSubscriptionStatus();
  if (persisted === 'subscribed') {
    return {
      isActive: true,
      isTrialing: false,
      trialEndsAt: null,
      statusCode: 'subscribed',
      planId: null, // TODO: persist planId too
      willRenew: true,
      currentPeriodEnd: null,
    };
  }

  // Fall back to trial logic
  const trialStartedAt = await getTrialStartedAt();

  if (trialStartedAt === null) {
    // First-ever launch; auto-start the trial
    await startTrial();
    const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_MS);
    return {
      isActive: true,
      isTrialing: true,
      trialEndsAt,
      statusCode: 'trial_active',
      planId: null,
      willRenew: false,
      currentPeriodEnd: trialEndsAt,
    };
  }

  const trialEndsAt = new Date(trialStartedAt + TRIAL_DURATION_MS);
  const inTrial = Date.now() < trialEndsAt.getTime();

  return {
    isActive: inTrial,
    isTrialing: inTrial,
    trialEndsAt: inTrial ? trialEndsAt : null,
    statusCode: inTrial ? 'trial_active' : 'trial_expired',
    planId: null,
    willRenew: false,
    currentPeriodEnd: inTrial ? trialEndsAt : null,
  };
}

/**
 * Returns true if the user currently has full access (trial or subscription).
 */
export async function isSubscribed(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status.isActive;
}

/**
 * Returns how many milliseconds remain in the user's trial, or 0 if expired.
 */
export async function getTrialRemainingMs(): Promise<number> {
  const startedAt = await getTrialStartedAt();
  if (startedAt === null) return TRIAL_DURATION_MS; // not started yet = full trial available
  const remaining = startedAt + TRIAL_DURATION_MS - Date.now();
  return Math.max(0, remaining);
}

// ---------------------------------------------------------------------------
// Purchase flow stubs
// ---------------------------------------------------------------------------

/**
 * Initiates a purchase for the given product.
 *
 * TODO (billing sprint): Replace with real StoreKit / RevenueCat flow.
 *   import Purchases from 'react-native-purchases';
 *   const offerings = await Purchases.getOfferings();
 *   const package = offerings.current?.monthly;
 *   const { customerInfo } = await Purchases.purchasePackage(package);
 */
export async function startPurchase(productId: ProductId): Promise<PurchaseResult> {
  // TODO: implement real purchase
  console.warn('[Subscription] startPurchase() is a stub. Product:', productId);
  return {
    success: false,
    error: 'Billing not yet implemented. This will be completed in the billing sprint.',
  };
}

/**
 * Restores previous purchases (required by App Store guidelines).
 *
 * TODO (billing sprint): Implement via react-native-purchases:
 *   const { customerInfo } = await Purchases.restorePurchases();
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  // TODO: implement restore
  console.warn('[Subscription] restorePurchases() is a stub.');
  return {
    success: false,
    error: 'Restore not yet implemented.',
  };
}

/**
 * Marks the user as subscribed in local storage.
 * Call this immediately after a successful StoreKit transaction to prevent
 * UI flicker while the backend validates the receipt.
 *
 * TODO (billing sprint): Remove optimistic update once server validation is live.
 */
export async function optimisticallyMarkSubscribed(): Promise<void> {
  await setPersistedSubscriptionStatus('subscribed');
}

/**
 * Clears the optimistic subscription flag (e.g. if server validation fails).
 */
export async function clearOptimisticSubscription(): Promise<void> {
  await setPersistedSubscriptionStatus('unknown');
}

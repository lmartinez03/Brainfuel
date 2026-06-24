/**
 * Subscription service (Apple StoreKit via react-native-iap, the same library
 * proven in the Forkd app). No third party, no accounts, no backend.
 *
 * Brainfuel REQUIRES a subscription to use the app. Access is an Apple StoreKit
 * entitlement tied to the user's Apple ID, so:
 *   - There is no Brainfuel login and no server. Apple owns the receipt.
 *   - hasActiveSubscription() asks StoreKit directly whether this Apple ID has
 *     an active sub, and caches the answer on-device for a fast next launch.
 *   - "Restore" re-reads the same Apple ID receipt on any device.
 *   - The 3-day free trial on the annual plan is an App Store Connect
 *     introductory offer, configured there, not timed in code.
 *
 * react-native-iap is a native module, so it is require-guarded: in Expo Go, on
 * web, and in tests (no StoreKit) it is absent and we fall back to a local grant
 * so the app stays usable while developing. Real billing runs in a dev build.
 */

import {
  getPersistedSubscriptionStatus,
  setPersistedSubscriptionStatus,
} from './storage';

// Guarded native import. Present only in a dev/production build with StoreKit.
let IAP: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IAP = require('react-native-iap');
} catch {
  IAP = null;
}

// Product identifiers. These must match the auto-renewing subscription products
// created in App Store Connect, with the 3-day free trial set as an
// introductory offer on the annual product only.
export const PRODUCT_IDS = {
  monthly: 'com.brainfuel.app.pro.monthly',
  annual: 'com.brainfuel.app.pro.annual',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

const ALL_PRODUCT_IDS: string[] = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];

/**
 * Display pricing for the paywall. The App Store is the real source of truth for
 * localized prices; these strings drive the layout and must match the prices you
 * set in App Store Connect.
 */
export const PRICING = {
  monthly: {
    price: '$5.99',
    period: 'month',
  },
  annual: {
    price: '$39.99',
    period: 'year',
    /** Annual price divided across 12 months, for the "cheaper per month" pitch. */
    perMonth: '$3.33',
    /** Rounded saving vs 12 months at the monthly price ($71.88). */
    savingsPercent: 44,
    trialDays: 3,
  },
} as const;

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

// StoreKit connection + listeners are set up once, lazily.
let connected = false;
let listenersBound = false;
// A purchase is event-based: requestPurchase() kicks it off and the result
// arrives on a listener. This resolver bridges that back to startPurchase().
let pendingPurchase: ((result: PurchaseResult) => void) | null = null;

function settlePurchase(result: PurchaseResult): void {
  const resolve = pendingPurchase;
  pendingPurchase = null;
  resolve?.(result);
}

function bindListeners(): void {
  if (listenersBound || !IAP) return;
  listenersBound = true;

  IAP.purchaseUpdatedListener(async (purchase: any) => {
    try {
      // Acknowledge the transaction with Apple so it is not refunded after 3 days.
      await IAP.finishTransaction({ purchase, isConsumable: false });
    } catch {
      // Even if finishing throws, the entitlement is live; treat it as a success.
    }
    await setPersistedSubscriptionStatus('subscribed');
    settlePurchase({ success: true });
  });

  IAP.purchaseErrorListener((error: any) => {
    const cancelled = error?.code === 'E_USER_CANCELLED';
    settlePurchase({
      success: false,
      error: cancelled ? undefined : error?.message || 'Purchase failed.',
    });
  });
}

async function ensureConnection(): Promise<void> {
  if (connected || !IAP) return;
  await IAP.initConnection();
  connected = true;
  bindListeners();
}

/**
 * Whether the user currently has an active subscription (or trial). The whole
 * app is gated on this. Queries StoreKit when available and caches the result;
 * falls back to the cached value when StoreKit is unavailable (Expo Go, offline).
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const cached = (await getPersistedSubscriptionStatus()) === 'subscribed';
  if (!IAP) return cached;
  try {
    await ensureConnection();
    const active: boolean = await IAP.hasActiveSubscriptions(ALL_PRODUCT_IDS);
    if (active) {
      await setPersistedSubscriptionStatus('subscribed');
      return true;
    }
    // Apple reports no active subscription. Only enforce that (and lock the user
    // out) once the products actually exist in App Store Connect. Before then
    // there is nothing to buy, so we keep whatever access was granted for
    // testing rather than wiping it on every launch.
    if (await storeHasProducts()) {
      await setPersistedSubscriptionStatus('unknown');
      return false;
    }
    return cached;
  } catch {
    return cached;
  }
}

/**
 * Whether the subscription products are actually purchasable yet. Returns false
 * before they are created in App Store Connect (or while the Paid Apps agreement
 * is pending), which is how the app knows billing is not live yet.
 */
async function storeHasProducts(): Promise<boolean> {
  if (!IAP) return false;
  try {
    const products = await IAP.fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'subs' });
    return Array.isArray(products) && products.length > 0;
  } catch {
    return false;
  }
}

/**
 * Starts a purchase for the given plan. The annual plan begins with the 3-day
 * free trial; the monthly plan bills immediately. Resolves once the entitlement
 * is active (or the user cancels / it fails).
 */
export async function startPurchase(productId: ProductId): Promise<PurchaseResult> {
  // No StoreKit (Expo Go / web): grant locally so the app stays usable in dev.
  if (!IAP) {
    await setPersistedSubscriptionStatus('subscribed');
    return { success: true };
  }
  try {
    await ensureConnection();
    // Load the product first. If the store returns nothing, the subscriptions
    // are not live in App Store Connect yet (or the Paid Apps agreement is
    // pending), so there is nothing to buy. Grant access locally so testing is
    // not blocked; once the products exist, the real purchase below runs.
    const products = await IAP.fetchProducts({ skus: [productId], type: 'subs' });
    if (!Array.isArray(products) || products.length === 0) {
      // In a dev build the products may not be live in App Store Connect yet, so
      // grant locally rather than locking the developer out while testing. In a
      // production build we never hand out free access if the store is
      // unreachable; the user simply tries again.
      if (__DEV__) {
        console.warn(`[Subscription] "${productId}" unavailable from the store; granting locally (dev build only).`);
        await setPersistedSubscriptionStatus('subscribed');
        return { success: true };
      }
      return {
        success: false,
        error: 'Subscriptions are temporarily unavailable. Please try again in a moment.',
      };
    }
    return await new Promise<PurchaseResult>((resolve) => {
      pendingPurchase = resolve;
      IAP.requestPurchase({ request: { apple: { sku: productId } }, type: 'subs' }).catch(
        (e: any) => settlePurchase({ success: false, error: e?.message || 'Purchase failed.' }),
      );
    });
  } catch (e: any) {
    return { success: false, error: e?.message || 'Purchase failed.' };
  }
}

/**
 * Restores a previous purchase (required by App Store guidelines). Re-reads the
 * Apple ID receipt via StoreKit; no account needed.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!IAP) {
    const active = (await getPersistedSubscriptionStatus()) === 'subscribed';
    return active
      ? { success: true }
      : { success: false, error: 'No active subscription found for this Apple ID.' };
  }
  try {
    await ensureConnection();
    const active: boolean = await IAP.hasActiveSubscriptions(ALL_PRODUCT_IDS);
    await setPersistedSubscriptionStatus(active ? 'subscribed' : 'unknown');
    return active
      ? { success: true }
      : { success: false, error: 'No active subscription found for this Apple ID.' };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not restore purchases.' };
  }
}

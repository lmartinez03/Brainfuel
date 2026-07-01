// src/config/featureFlags.ts
//
// Central on/off switches for features that ship dark (built but hidden) so we
// can launch a lean app now and reveal the rest with a one-line change.
//
// economyEnabled: the whole "minutes economy" layer. When false (launch state)
// the UI hides the minutes balance, the cart/shop, and the Brain XP / level.
// The data + helpers still exist (see src/services/storage.ts and
// src/economy/shopItems.ts), so flipping this to true brings the shop, currency
// balance, XP and brain level back without rebuilding the backend.

export const featureFlags = {
  economyEnabled: false,
  badgesEnabled: false,
  subscriptionEnabled: false,
} as const;

/** Master switch for the minutes economy (shop, currency, XP, brain level). */
export const ECONOMY_ENABLED = featureFlags.economyEnabled;

/** Shows the achievement badges grid on the profile. Hidden for launch. */
export const BADGES_ENABLED = featureFlags.badgesEnabled;

/**
 * Master switch for the mandatory subscription paywall. When false (launch
 * state) the app is free: onboarding leads straight into the app, nothing forces
 * the paywall, and the subscription rows are hidden. The StoreKit code and
 * paywall screen still exist, so flipping this to true restores the gate without
 * rebuilding anything.
 */
export const SUBSCRIPTION_ENABLED = featureFlags.subscriptionEnabled;

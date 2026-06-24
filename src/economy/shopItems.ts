// src/economy/shopItems.ts
//
// The Minute Market catalog. This ships dark for launch (featureFlags.economyEnabled
// is false), but lives here so the shop is a UI build away, not a backend rebuild.
//
// Spending/earning is already wired in src/services/storage.ts:
//   addMinutes / spendMinutes / addXp / markItemOwned / isItemOwned
// A future ShopScreen reads SHOP_ITEMS, calls spendMinutes(price), then applies
// the item's `action` (grant time, unlock a cosmetic, etc.).

export type ShopAction = 'time' | 'cosmetic' | 'boost' | 'shield';

export interface ShopItem {
  id: string;
  emoji: string;
  /** Tile background colour (hex). */
  bg: string;
  /** Display name. */
  name: string;
  /** One-line description. */
  desc: string;
  /** Cost in banked minutes. 0 = free. */
  price: number;
  /** Re-buyable (consumables) vs one-time (cosmetics). */
  repeat?: boolean;
  action: ShopAction;
  /** For action 'time': minutes granted. */
  amount?: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'unlock15', emoji: '⏱️', bg: '#ffd23f', name: '+15 min', desc: 'Instant screen time, no quiz', price: 0, repeat: true, action: 'time', amount: 15 },
  { id: 'unlock30', emoji: '🎟️', bg: '#ff5630', name: '+30 min', desc: 'A bigger chunk of time', price: 25, repeat: true, action: 'time', amount: 30 },
  { id: 'hat', emoji: '🎩', bg: '#7b3ff2', name: 'Top Hat', desc: 'A dapper hat for Noodle', price: 60, action: 'cosmetic' },
  { id: 'crown', emoji: '👑', bg: '#ffd23f', name: 'Brain Crown', desc: 'Royalty for your buddy', price: 120, action: 'cosmetic' },
  { id: 'double', emoji: '⚡', bg: '#2fbf9e', name: '2x Earn Boost', desc: 'Double minutes for 1 hour', price: 80, repeat: true, action: 'boost' },
  { id: 'theme', emoji: '🌈', bg: '#ff4d6d', name: 'Confetti Theme', desc: 'Extra sparkles everywhere', price: 50, action: 'cosmetic' },
  { id: 'shield', emoji: '🛡️', bg: '#ff7a3c', name: 'Focus Shield', desc: 'Block everything for 2 hrs', price: 35, repeat: true, action: 'shield' },
];

/** Minutes + Brain XP awarded for a winning quiz (used once the economy is live). */
export const QUIZ_REWARD = {
  minutes: 15,
  /** XP per correct answer, plus a flat bonus for a perfect run. */
  xpPerCorrect: 20,
  xpWinBonus: 30,
} as const;

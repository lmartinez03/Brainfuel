// data.ts
// Static content + shared types for Brainfuel.

import { gradients } from './theme';

export type AppItem = {
  id: string;
  nm: string;
  grad: [string, string];
  cat: string;
  mins: number;
};

export const APPS: AppItem[] = [
  { id: 'scrollr', nm: 'Scrollr', grad: gradients.scrollr, cat: 'Social', mins: 84 },
  { id: 'loopz', nm: 'Loopz', grad: gradients.loopz, cat: 'Video', mins: 61 },
  { id: 'chattr', nm: 'Chattr', grad: gradients.chattr, cat: 'Chat', mins: 38 },
  { id: 'pulse', nm: 'Pulse', grad: gradients.pulse, cat: 'News', mins: 22 },
  { id: 'snapz', nm: 'Snapz', grad: gradients.snapz, cat: 'Photo', mins: 17 },
];

export type Question = { q: string; a: string[]; c: number };

export const TRIVIA: Question[] = [
  { q: 'Which planet is known as the Red Planet?', a: ['Venus', 'Mars', 'Jupiter', 'Mercury'], c: 1 },
  { q: 'How many bones are in the adult human body?', a: ['206', '112', '300', '178'], c: 0 },
  { q: "What's the largest ocean on Earth?", a: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], c: 3 },
  { q: 'Who painted the Mona Lisa?', a: ['Van Gogh', 'Da Vinci', 'Picasso', 'Monet'], c: 1 },
  { q: 'What gas do plants absorb from the air?', a: ['Oxygen', 'Nitrogen', 'CO₂', 'Helium'], c: 2 },
  { q: 'How many continents are there?', a: ['5', '6', '7', '8'], c: 2 },
  { q: 'What is the hardest natural substance?', a: ['Gold', 'Iron', 'Diamond', 'Quartz'], c: 2 },
  { q: 'Which animal is the fastest on land?', a: ['Cheetah', 'Lion', 'Horse', 'Gazelle'], c: 0 },
  { q: 'What language has the most native speakers?', a: ['English', 'Spanish', 'Hindi', 'Mandarin'], c: 3 },
  { q: 'How many strings does a standard guitar have?', a: ['4', '6', '7', '12'], c: 1 },
];

export type ShopAction = 'time' | 'freeze' | 'cosmetic' | 'boost' | 'shield';

export type ShopItem = {
  id: string;
  emoji: string;
  bg: string;
  nm: string;
  ds: string;
  price: number;
  repeat?: boolean;
  action: ShopAction;
  amount?: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'unlock15', emoji: '⏱️', bg: '#ffd23f', nm: '+15 min', ds: 'Instant screen time, no quiz', price: 0, repeat: true, action: 'time', amount: 15 },
  { id: 'unlock30', emoji: '🎟️', bg: '#ff5630', nm: '+30 min', ds: 'A bigger chunk of time', price: 25, repeat: true, action: 'time', amount: 30 },
  { id: 'freeze', emoji: '🧊', bg: '#3f9bff', nm: 'Streak Freeze', ds: 'Skip a day, keep your streak', price: 40, repeat: true, action: 'freeze' },
  { id: 'hat', emoji: '🎩', bg: '#7b3ff2', nm: 'Top Hat', ds: 'A dapper hat for Noodle', price: 60, action: 'cosmetic' },
  { id: 'crown', emoji: '👑', bg: '#ffd23f', nm: 'Brain Crown', ds: 'Royalty for your buddy', price: 120, action: 'cosmetic' },
  { id: 'double', emoji: '⚡', bg: '#2fbf9e', nm: '2× Earn Boost', ds: 'Double minutes for 1 hour', price: 80, repeat: true, action: 'boost' },
  { id: 'theme', emoji: '🌈', bg: '#ff4d6d', nm: 'Confetti Theme', ds: 'Extra sparkles everywhere', price: 50, action: 'cosmetic' },
  { id: 'shield', emoji: '🛡️', bg: '#ff7a3c', nm: 'Focus Shield', ds: 'Block everything for 2 hrs', price: 35, repeat: true, action: 'shield' },
];

export type DaySaved = { d: string; v: number };

export const WEEK_SAVED: DaySaved[] = [
  { d: 'M', v: 142 },
  { d: 'T', v: 98 },
  { d: 'W', v: 175 },
  { d: 'T', v: 120 },
  { d: 'F', v: 88 },
  { d: 'S', v: 210 },
  { d: 'S', v: 134 },
];

export type Badge = { em: string; nm: string; on: boolean };

export const BADGES: Badge[] = [
  { em: '🔥', nm: '7-Day Streak', on: true },
  { em: '🧠', nm: 'Brainiac', on: true },
  { em: '⚡', nm: 'Quick Wit', on: true },
  { em: '🎯', nm: 'Perfect Quiz', on: true },
  { em: '🌙', nm: 'Night Owl', on: false },
  { em: '💎', nm: '30-Day Club', on: false },
];

// Shared app state shape (lifted in App.tsx)
export type AppState = {
  minutes: number;
  streak: number;
  xp: number;
  saved: number; // minutes saved today
  blocked: Record<string, boolean>;
  owned: Record<string, boolean>;
  doubleBoost: boolean;
};

export const INITIAL_STATE: AppState = {
  minutes: 12,
  streak: 7,
  xp: 340,
  saved: 134,
  blocked: { scrollr: true, loopz: true, chattr: true, pulse: true, snapz: false },
  owned: {},
  doubleBoost: false,
};

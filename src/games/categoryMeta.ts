/**
 * Frontend-only extension of CATEGORY_META from games/index.ts.
 * Adds emoji icons and other UI-specific fields not in the backend types.
 */
import { GameCategory } from './types';

export const CATEGORY_EMOJI: Record<GameCategory, string> = {
  memory: '🧠',
  math: '🔢',
  puzzles: '🧩',
  riddles: '🎭',
  sequences: '🔗',
  wordplay: '💬',
  random: '🎲',
};

export const ALL_CATEGORIES: GameCategory[] = [
  'random',
  'memory',
  'math',
  'puzzles',
  'riddles',
  'sequences',
  'wordplay',
];

/**
 * Brainfuel Games Engine: public API.
 *
 * Exposes the primary function: getQuiz({ category, count }) returning Question[]
 *
 * Questions are drawn from curated banks (memory, puzzles, riddles, sequences,
 * wordplay) or generated procedurally (math). Both the question order AND the
 * answer-choice order are shuffled on every call so the correct answer never
 * sits in a predictable position.
 *
 * Usage:
 *   import { getQuiz } from '@games/index';
 *   const questions = getQuiz({ category: 'random', count: 3 });
 */

import { Question, GameCategory, GetQuizOptions } from './types';
import { memoryQuestions } from './categories/memory';
import { generateMemoryQuestions } from './categories/memoryGenerated';
import { generateMathQuestions } from './categories/math';
import { puzzlesQuestions } from './categories/puzzles';
import { riddlesQuestions } from './categories/riddles';
import { sequencesQuestions } from './categories/sequences';
import { wordplayQuestions } from './categories/wordplay';

// Re-export types so importers only need a single import path
export type { Question, GameCategory, GetQuizOptions, QuizCount } from './types';

// Internal helpers

/**
 * Dev-only guard: a question must have four DISTINCT choices and an in-range
 * answerIndex. Duplicate choices break answer matching (the engine matches by
 * index, so an identical distractor reads as wrong when tapped). Logs loudly in
 * development; does nothing in production.
 */
function validateQuestions(questions: Question[]): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  for (const q of questions) {
    if (new Set(q.choices).size !== q.choices.length) {
      console.warn(`[games] ${q.id} has duplicate choices:`, q.choices);
    }
    if (q.answerIndex < 0 || q.answerIndex > 3) {
      console.warn(`[games] ${q.id} has an out-of-range answerIndex:`, q.answerIndex);
    }
  }
}

/** Fisher-Yates shuffle. Returns a new shuffled array (does not mutate). */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffle the choices of a single question while keeping the answerIndex
 * correctly pointing at the answer after the shuffle.
 */
function shuffleChoices(question: Question): Question {
  const indexed = question.choices.map((choice, i) => ({
    choice,
    correct: i === question.answerIndex,
  }));
  const shuffled = shuffleArray(indexed);
  const newAnswerIndex = shuffled.findIndex((item) => item.correct) as 0 | 1 | 2 | 3;
  return {
    ...question,
    choices: shuffled.map((item) => item.choice) as [string, string, string, string],
    answerIndex: newAnswerIndex,
  };
}

/**
 * Pick `count` unique questions from a bank, shuffle them, and shuffle each
 * question's answer choices.
 */
function sampleFromBank(bank: Question[], count: number): Question[] {
  if (bank.length === 0) return [];
  const shuffledBank = shuffleArray(bank);
  const picked = shuffledBank.slice(0, Math.min(count, shuffledBank.length));
  return picked.map(shuffleChoices);
}

// Category banks

/**
 * All curated category banks keyed by category name.
 * Math is excluded here because it is procedurally generated.
 */
const CURATED_BANKS: Record<Exclude<GameCategory, 'math' | 'random'>, Question[]> = {
  memory: memoryQuestions,
  puzzles: puzzlesQuestions,
  riddles: riddlesQuestions,
  sequences: sequencesQuestions,
  wordplay: wordplayQuestions,
};

const CURATED_CATEGORY_NAMES = Object.keys(CURATED_BANKS) as Exclude<
  GameCategory,
  'math' | 'random'
>[];

const ALL_CATEGORY_NAMES: Exclude<GameCategory, 'random'>[] = [
  ...CURATED_CATEGORY_NAMES,
  'math',
];

// Public API

/**
 * How many fresh math questions to fold into the 'random' mix pool. Roughly the
 * size of one curated bank, so every category (math included) is represented
 * about equally when questions are drawn at random.
 */
const RANDOM_MIX_MATH_COUNT = 30;

/**
 * Returns `count` shuffled questions for the requested category.
 *
 * - category 'random': mixes questions from EVERY category into one pool, so
 *                      each question in the quiz can come from any category
 * - category 'math': procedurally generates fresh questions every call
 * - All other categories: sampled from the curated bank, shuffled
 *
 * Answer choices are also shuffled, so the correct answer is never in a
 * predictable position. Use `question.answerIndex` to know which choice
 * is correct after shuffling.
 */
export function getQuiz({ category, count }: GetQuizOptions): Question[] {
  const seed = Date.now();
  let result: Question[];

  if (category === 'random') {
    // True random mix: pool every curated bank together with fresh batches of
    // generated math AND memory questions, then draw `count` from the combined
    // pool. A single quiz can span multiple categories.
    const mixedPool: Question[] = [
      ...CURATED_CATEGORY_NAMES.flatMap((c) => CURATED_BANKS[c]),
      ...generateMathQuestions(RANDOM_MIX_MATH_COUNT, seed),
      ...generateMemoryQuestions(RANDOM_MIX_MATH_COUNT, seed),
    ];
    result = sampleFromBank(mixedPool, count);
  } else if (category === 'math') {
    result = generateMathQuestions(count, seed).map(shuffleChoices);
  } else if (category === 'memory') {
    // Memory leans on fresh, randomised questions (randomised items AND target)
    // so the answers cannot be memorised, with a few curated questions mixed in
    // for variety (stories, patterns, logic).
    const pool: Question[] = [
      ...generateMemoryQuestions(count + 3, seed),
      ...shuffleArray(memoryQuestions).slice(0, 3),
    ];
    result = sampleFromBank(pool, count);
  } else {
    const bank = CURATED_BANKS[category as Exclude<GameCategory, 'math' | 'random'>];
    result = sampleFromBank(bank, count);
  }

  validateQuestions(result);
  return result;
}

/**
 * Returns all available non-random category names.
 * Useful for populating the settings screen category picker.
 */
export function getAvailableCategories(): Exclude<GameCategory, 'random'>[] {
  return [...ALL_CATEGORY_NAMES];
}

/**
 * Returns the approximate question-pool size for a given category.
 * For 'math' this returns Infinity because questions are procedurally generated.
 */
export function getCategoryPoolSize(category: Exclude<GameCategory, 'random'>): number {
  if (category === 'math') return Infinity;
  return CURATED_BANKS[category as Exclude<GameCategory, 'math' | 'random'>].length;
}

/**
 * UI metadata for each category: labels, descriptions, and theme gradients.
 * Used by the category picker and quiz screen header.
 */
export const CATEGORY_META: Record<
  GameCategory,
  { label: string; description: string; gradient: readonly [string, string] }
> = {
  memory: {
    label: 'Memory',
    description: 'Recall sequences, facts, and stories under time pressure',
    gradient: ['#9B59F5', '#6B21D4'],
  },
  math: {
    label: 'Mental Math',
    description: 'Fresh arithmetic and number challenges every session',
    gradient: ['#00F5FF', '#0077AA'],
  },
  puzzles: {
    label: 'Puzzles',
    description: 'Logic, spatial reasoning, and pattern recognition',
    gradient: ['#FF6B35', '#CC3300'],
  },
  riddles: {
    label: 'Riddles',
    description: 'Lateral thinking and "aha!" insight challenges',
    gradient: ['#FFD600', '#FF8C00'],
  },
  sequences: {
    label: 'Sequences',
    description: 'Find the rule in number and letter patterns',
    gradient: ['#4ECDC4', '#006B5C'],
  },
  wordplay: {
    label: 'Wordplay',
    description: 'Anagrams, vocabulary, and verbal reasoning',
    gradient: ['#FF4D8B', '#A00040'],
  },
  random: {
    label: 'Random Mix',
    description: 'All categories, maximum variety every time',
    gradient: ['#FF4D6D', '#9B59F5'],
  },
};

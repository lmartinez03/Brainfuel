/**
 * Core types for the Brainfuel games engine.
 * These interfaces are consumed by both the games engine and the UI layer.
 */

export type GameCategory =
  | 'memory'
  | 'math'
  | 'puzzles'
  | 'riddles'
  | 'sequences'
  | 'wordplay'
  | 'random';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  /** Unique identifier for this question (used for deduplication). */
  id: string;
  /** Which category this question belongs to. */
  category: Exclude<GameCategory, 'random'>;
  /** The question text shown to the user. */
  prompt: string;
  /** Four answer choices (A to D). Always exactly 4. */
  choices: [string, string, string, string];
  /** Zero-based index into `choices` indicating the correct answer. */
  answerIndex: 0 | 1 | 2 | 3;
  difficulty?: Difficulty;
  /** Shown after the user answers (right or wrong). */
  explanation?: string;
}

export type QuizCount = 1 | 3 | 5;

export interface GetQuizOptions {
  category: GameCategory;
  count: QuizCount;
}

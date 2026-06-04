/**
 * Math category: PROCEDURALLY GENERATED mental arithmetic questions.
 *
 * WHY MENTAL MATH WORKS:
 * Mental arithmetic activates the intraparietal sulcus (IPS), a region
 * associated with numerical magnitude processing, and the prefrontal cortex
 * for working-memory maintenance during multi-step calculations (Dehaene et al.,
 * 2003; Menon, 2010). Multi-step mental math problems (particularly those that
 * combine operations) demand sustained attention and inhibit automatic/habitual
 * responses, which is a hallmark of executive function training. Even brief
 * arithmetic tasks can measurably increase cognitive arousal and reduce
 * mind-wandering (Smallwood & Schooler, 2015).
 *
 * GENERATION STRATEGY:
 * generateMathQuestion() produces a fresh, seeded question on every call using
 * a seeded PRNG so results are reproducible within a session but vary across
 * sessions. Four difficulty tiers are used. The function is effectively
 * unlimited: the question pool never repeats in practice.
 *
 * All questions are generated algorithmically. No third-party question database
 * is used. Content ownership is clear.
 */

import { Question, Difficulty } from '../types';

// ---------------------------------------------------------------------------
// Tiny seeded PRNG (Mulberry32). No external dependency required.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Shuffle an array in place using Fisher-Yates with the provided rng. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate three plausible-but-wrong integer distractors for a given answer. */
function intDistractors(answer: number, rng: () => number): number[] {
  const distractors = new Set<number>();
  const offsets = [1, 2, 3, 4, 5, 7, 10, -1, -2, -3, -5];
  shuffle(offsets, rng);
  for (const offset of offsets) {
    const d = answer + offset;
    if (d !== answer && !distractors.has(d)) {
      distractors.add(d);
      if (distractors.size === 3) break;
    }
  }
  // Fallback in the unlikely event we need more
  let extra = answer + 100;
  while (distractors.size < 3) {
    if (!distractors.has(extra)) distractors.add(extra);
    extra++;
  }
  return Array.from(distractors);
}

// ---------------------------------------------------------------------------
// Question generators by difficulty tier
// ---------------------------------------------------------------------------

type Generator = (seed: number) => Question;

const easyGenerators: Generator[] = [
  // Simple addition
  (seed) => {
    const rng = mulberry32(seed);
    const a = randInt(rng, 10, 99);
    const b = randInt(rng, 10, 99);
    const answer = a + b;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-easy-add-${seed}`,
      category: 'math',
      prompt: `What is ${a} + ${b}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'easy',
      explanation: `${a} + ${b} = ${answer}`,
    };
  },
  // Simple subtraction
  (seed) => {
    const rng = mulberry32(seed);
    const b = randInt(rng, 10, 50);
    const a = randInt(rng, b + 1, b + 80);
    const answer = a - b;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-easy-sub-${seed}`,
      category: 'math',
      prompt: `What is ${a} − ${b}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'easy',
      explanation: `${a} − ${b} = ${answer}`,
    };
  },
  // Times-table
  (seed) => {
    const rng = mulberry32(seed);
    const a = randInt(rng, 2, 12);
    const b = randInt(rng, 2, 12);
    const answer = a * b;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-easy-mul-${seed}`,
      category: 'math',
      prompt: `What is ${a} × ${b}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'easy',
      explanation: `${a} × ${b} = ${answer}. Quick recall of times-tables is the foundation of mental arithmetic.`,
    };
  },
];

const mediumGenerators: Generator[] = [
  // Two-step addition + subtraction
  (seed) => {
    const rng = mulberry32(seed);
    const a = randInt(rng, 20, 99);
    const b = randInt(rng, 10, 60);
    const c = randInt(rng, 5, 40);
    const answer = a + b - c;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-med-2step-${seed}`,
      category: 'math',
      prompt: `What is ${a} + ${b} − ${c}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'medium',
      explanation: `${a} + ${b} = ${a + b}, then ${a + b} − ${c} = ${answer}.`,
    };
  },
  // Percentage of a round number
  (seed) => {
    const rng = mulberry32(seed);
    const pcts = [10, 20, 25, 50, 75];
    const pct = pcts[randInt(rng, 0, pcts.length - 1)];
    const base = randInt(rng, 2, 20) * 4; // always divisible
    const answer = Math.round((pct / 100) * base);
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-med-pct-${seed}`,
      category: 'math',
      prompt: `What is ${pct}% of ${base}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'medium',
      explanation: `${pct}% of ${base} = (${pct} ÷ 100) × ${base} = ${answer}.`,
    };
  },
  // Square a small number
  (seed) => {
    const rng = mulberry32(seed);
    const n = randInt(rng, 6, 15);
    const answer = n * n;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-med-sq-${seed}`,
      category: 'math',
      prompt: `What is ${n}²?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'medium',
      explanation: `${n} × ${n} = ${answer}.`,
    };
  },
  // Division with remainder displayed as quotient only
  (seed) => {
    const rng = mulberry32(seed);
    const divisor = randInt(rng, 3, 9);
    const quotient = randInt(rng, 5, 20);
    const dividend = divisor * quotient;
    const answer = quotient;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-med-div-${seed}`,
      category: 'math',
      prompt: `What is ${dividend} ÷ ${divisor}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'medium',
      explanation: `${dividend} ÷ ${divisor} = ${answer}.`,
    };
  },
];

const hardGenerators: Generator[] = [
  // Three-step calculation
  (seed) => {
    const rng = mulberry32(seed);
    const a = randInt(rng, 10, 30);
    const b = randInt(rng, 3, 9);
    const c = randInt(rng, 10, 50);
    const answer = a * b + c;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-hard-3step-${seed}`,
      category: 'math',
      prompt: `What is (${a} × ${b}) + ${c}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'hard',
      explanation: `${a} × ${b} = ${a * b}, then + ${c} = ${answer}.`,
    };
  },
  // Mental power-of-two
  (seed) => {
    const rng = mulberry32(seed);
    const exp = randInt(rng, 5, 10);
    const answer = Math.pow(2, exp);
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-hard-pow2-${seed}`,
      category: 'math',
      prompt: `What is 2^${exp}?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'hard',
      explanation: `2^${exp} = ${answer}. Powers of 2 are fundamental in computing and everyday estimation.`,
    };
  },
  // Reverse percentage: find the original value
  (seed) => {
    const rng = mulberry32(seed);
    const pcts = [20, 25, 50];
    const pct = pcts[randInt(rng, 0, pcts.length - 1)];
    const original = randInt(rng, 4, 20) * 10;
    const partValue = Math.round((pct / 100) * original);
    const answer = original;
    const wrong = intDistractors(answer, rng);
    const allChoices = shuffle([answer, ...wrong], rng);
    const answerIndex = allChoices.indexOf(answer) as 0 | 1 | 2 | 3;
    return {
      id: `math-hard-revpct-${seed}`,
      category: 'math',
      prompt: `${partValue} is ${pct}% of what number?`,
      choices: allChoices.map(String) as [string, string, string, string],
      answerIndex,
      difficulty: 'hard',
      explanation: `${partValue} ÷ (${pct} ÷ 100) = ${partValue} ÷ ${pct / 100} = ${answer}.`,
    };
  },
];

// ---------------------------------------------------------------------------
// Public API: generate a batch of non-repeating math questions
// ---------------------------------------------------------------------------

/**
 * Generates `count` procedurally-created math questions. The `sessionSeed`
 * should differ per quiz session so questions are not repeated across sessions
 * (e.g. pass Date.now()). Within a session the questions are deterministic.
 */
export function generateMathQuestions(
  count: number,
  sessionSeed: number = Date.now(),
  difficulty?: Difficulty,
): Question[] {
  const rng = mulberry32(sessionSeed);
  const questions: Question[] = [];
  const seenIds = new Set<string>();

  const allGenerators =
    difficulty === 'easy'
      ? easyGenerators
      : difficulty === 'hard'
      ? hardGenerators
      : [...easyGenerators, ...mediumGenerators, ...hardGenerators];

  while (questions.length < count) {
    const gen = allGenerators[Math.floor(rng() * allGenerators.length)];
    const seed = Math.floor(rng() * 1_000_000);
    const q = gen(seed);
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      questions.push(q);
    }
  }

  return questions;
}

/**
 * Memory category: PROCEDURALLY GENERATED recall questions.
 *
 * The static memory bank (memory.ts) has fixed sequences, so a desperate user
 * eventually memorises the answers. These generators randomise BOTH the items
 * (which colours/animals/numbers appear) AND what is asked (which position, or
 * which item was missing), so every play is fresh.
 *
 * Every generated question:
 *  - puts the material in `memorize`, so the quiz hides it before the question
 *    (see the study phase in app/quiz.tsx), and
 *  - has four DISTINCT choices, so tapping the right value can never collide
 *    with an identical distractor.
 *
 * All content is generated algorithmically. No third-party question sets used.
 */

import { Question } from '../types';

// Tiny seeded PRNG (Mulberry32), matching the math generator's approach.
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick `n` distinct items from a pool. */
function sampleDistinct<T>(pool: T[], n: number, rng: () => number): T[] {
  return shuffle(pool, rng).slice(0, n);
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'];

// Item pools. Each has enough distinct entries to fill a sequence plus
// off-list distractors.
const POOLS: { items: string[]; noun: string }[] = [
  { items: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'], noun: 'colour' },
  { items: ['Cat', 'Dog', 'Bird', 'Fish', 'Horse', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Deer'], noun: 'animal' },
  { items: ['Apple', 'Mango', 'Lemon', 'Grape', 'Peach', 'Melon', 'Cherry', 'Plum', 'Kiwi', 'Lime'], noun: 'fruit' },
  { items: ['2', '3', '4', '5', '6', '7', '8', '9'], noun: 'number' },
];

type GenQuestion = Omit<Question, 'choices'> & { choices: string[] };

/** "Which {noun} was in the {ordinal} position?" with randomised list + target. */
function positionRecall(pool: { items: string[]; noun: string }, seed: number, rng: () => number): GenQuestion {
  const len = randInt(rng, 4, 5);
  const seq = sampleDistinct(pool.items, len, rng);
  const pos = randInt(rng, 1, len);
  const correct = seq[pos - 1];

  // Distractors are the OTHER shown items, so every choice was on the list.
  const distractors = shuffle(seq.filter((x) => x !== correct), rng).slice(0, 3);
  const choices = shuffle([correct, ...distractors], rng);

  return {
    id: `memgen-pos-${seed}`,
    category: 'memory',
    memorize: `${pool.noun === 'number' ? 'A sequence:' : 'A list:'}\n\n${seq.join('   ')}`,
    prompt: `Which ${pool.noun} was in the ${ORDINALS[pos - 1]} position?`,
    choices,
    answerIndex: choices.indexOf(correct) as 0 | 1 | 2 | 3,
    difficulty: len >= 5 ? 'medium' : 'easy',
    explanation: `The ${ORDINALS[pos - 1]} ${pool.noun} was ${correct}. The list was ${seq.join(', ')}.`,
  };
}

/** "Which {noun} was NOT in the list?" with one off-list item as the answer. */
function notShown(pool: { items: string[]; noun: string }, seed: number, rng: () => number): GenQuestion {
  const len = randInt(rng, 4, 5);
  const seq = sampleDistinct(pool.items, len, rng);
  const offList = pool.items.filter((x) => !seq.includes(x));
  const correct = offList[Math.floor(rng() * offList.length)];

  const distractors = shuffle(seq, rng).slice(0, 3);
  const choices = shuffle([correct, ...distractors], rng);

  return {
    id: `memgen-not-${seed}`,
    category: 'memory',
    memorize: `${pool.noun === 'number' ? 'A sequence:' : 'A list:'}\n\n${seq.join('   ')}`,
    prompt: `Which ${pool.noun} was NOT in the list?`,
    choices,
    answerIndex: choices.indexOf(correct) as 0 | 1 | 2 | 3,
    difficulty: 'medium',
    explanation: `${correct} was not shown. The list was ${seq.join(', ')}.`,
  };
}

/**
 * Generate `count` fresh, randomised memory questions. Pass a per-session seed
 * (e.g. Date.now()) so the set differs each session but is stable within it.
 */
export function generateMemoryQuestions(count: number, sessionSeed: number = Date.now()): Question[] {
  const rng = mulberry32(sessionSeed);
  const out: Question[] = [];
  const seen = new Set<string>();

  while (out.length < count) {
    const pool = POOLS[Math.floor(rng() * POOLS.length)];
    const seed = Math.floor(rng() * 1_000_000);
    const gen = rng() < 0.7 ? positionRecall : notShown;
    const q = gen(pool, seed, rng);
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push({ ...q, choices: q.choices as [string, string, string, string] });
  }

  return out;
}

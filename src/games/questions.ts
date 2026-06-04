/**
 * LEGACY STUB. Do not import from this file.
 *
 * The full games engine is in:
 *   src/games/categories/memory.ts       (30 questions)
 *   src/games/categories/math.ts         (procedurally generated, unlimited)
 *   src/games/categories/puzzles.ts      (32 questions)
 *   src/games/categories/riddles.ts      (32 questions)
 *   src/games/categories/sequences.ts    (30 questions)
 *   src/games/categories/wordplay.ts     (30 questions)
 *   src/games/index.ts                   (getQuiz() public API)
 *
 * This file contains small sample questions used by the Frontend's early prototype.
 * It is kept for backward compatibility only. games/index.ts does NOT import from here.
 */

import { Question } from './types';

export const MEMORY_QUESTIONS: Question[] = [
  {
    id: 'mem_001',
    category: 'memory',
    prompt: 'Which of these is NOT a primary color?',
    choices: ['Red', 'Blue', 'Green', 'Yellow'],
    answerIndex: 2,
    explanation: 'Primary colors (in traditional art) are Red, Yellow, and Blue. Green is a secondary color.',
  },
  {
    id: 'mem_002',
    category: 'memory',
    prompt: 'How many days are in a leap year?',
    choices: ['363', '364', '365', '366'],
    answerIndex: 3,
    explanation: 'A leap year has 366 days, one extra day added to February.',
  },
  {
    id: 'mem_003',
    category: 'memory',
    prompt: 'Which planet is closest to the Sun?',
    choices: ['Venus', 'Mercury', 'Mars', 'Earth'],
    answerIndex: 1,
    explanation: 'Mercury is the closest planet to the Sun.',
  },
  {
    id: 'mem_004',
    category: 'memory',
    prompt: 'What is the chemical symbol for Gold?',
    choices: ['Go', 'Gd', 'Au', 'Ag'],
    answerIndex: 2,
    explanation: 'Gold\'s chemical symbol is Au, from the Latin word "Aurum".',
  },
  {
    id: 'mem_005',
    category: 'memory',
    prompt: 'How many bones are in the adult human body?',
    choices: ['186', '196', '206', '216'],
    answerIndex: 2,
    explanation: 'The adult human body has 206 bones.',
  },
  {
    id: 'mem_006',
    category: 'memory',
    prompt: 'What is the speed of light (approximately)?',
    choices: ['100,000 km/s', '200,000 km/s', '300,000 km/s', '400,000 km/s'],
    answerIndex: 2,
    explanation: 'Light travels at approximately 300,000 km/s (299,792 km/s precisely).',
  },
  {
    id: 'mem_007',
    category: 'memory',
    prompt: 'Which ocean is the largest?',
    choices: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answerIndex: 3,
    explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.',
  },
];

export const MATH_QUESTIONS: Question[] = [
  {
    id: 'math_001',
    category: 'math',
    prompt: 'What is 17 × 8?',
    choices: ['126', '136', '144', '152'],
    answerIndex: 1,
    explanation: '17 × 8 = 136',
  },
  {
    id: 'math_002',
    category: 'math',
    prompt: 'What is √144?',
    choices: ['11', '12', '13', '14'],
    answerIndex: 1,
    explanation: '√144 = 12, because 12 × 12 = 144.',
  },
  {
    id: 'math_003',
    category: 'math',
    prompt: 'If a shirt costs $45 and is 20% off, what do you pay?',
    choices: ['$34', '$36', '$38', '$40'],
    answerIndex: 1,
    explanation: '20% of $45 = $9. $45 − $9 = $36.',
  },
  {
    id: 'math_004',
    category: 'math',
    prompt: 'What is 15% of 200?',
    choices: ['20', '25', '30', '35'],
    answerIndex: 2,
    explanation: '15% × 200 = 0.15 × 200 = 30.',
  },
  {
    id: 'math_005',
    category: 'math',
    prompt: 'What is the next prime number after 13?',
    choices: ['14', '15', '17', '19'],
    answerIndex: 2,
    explanation: 'After 13, the next prime is 17 (14, 15, 16 are composite).',
  },
  {
    id: 'math_006',
    category: 'math',
    prompt: 'What is 2³ + 3²?',
    choices: ['13', '15', '17', '19'],
    answerIndex: 2,
    explanation: '2³ = 8, 3² = 9. 8 + 9 = 17.',
  },
  {
    id: 'math_007',
    category: 'math',
    prompt: 'A car travels 60mph for 2.5 hours. How far?',
    choices: ['120 miles', '135 miles', '150 miles', '165 miles'],
    answerIndex: 2,
    explanation: '60 × 2.5 = 150 miles.',
  },
  {
    id: 'math_008',
    category: 'math',
    prompt: 'What is 1000 ÷ 8?',
    choices: ['115', '120', '125', '130'],
    answerIndex: 2,
    explanation: '1000 ÷ 8 = 125.',
  },
];

export const PUZZLE_QUESTIONS: Question[] = [
  {
    id: 'puz_001',
    category: 'puzzles',
    prompt: 'I have cities but no houses, mountains but no trees, water but no fish, roads but no cars. What am I?',
    choices: ['A dream', 'A map', 'A painting', 'A mirror'],
    answerIndex: 1,
    explanation: 'A map has cities, mountains, water, and roads, but none of the real things.',
  },
  {
    id: 'puz_002',
    category: 'puzzles',
    prompt: 'The more you take, the more you leave behind. What am I?',
    choices: ['Time', 'Money', 'Footsteps', 'Memories'],
    answerIndex: 2,
    explanation: 'Every step you take, you leave a footprint behind.',
  },
  {
    id: 'puz_003',
    category: 'puzzles',
    prompt: 'What has a head, a tail, but no body?',
    choices: ['A snake', 'A coin', 'A nail', 'A river'],
    answerIndex: 1,
    explanation: 'A coin has a "head" and a "tail" but no body.',
  },
  {
    id: 'puz_004',
    category: 'puzzles',
    prompt: 'What 5-letter word becomes shorter when you add 2 letters?',
    choices: ['Fewer', 'Short', 'Trick', 'Quick'],
    answerIndex: 1,
    explanation: 'SHORT + ER = SHORTER!',
  },
  {
    id: 'puz_005',
    category: 'puzzles',
    prompt: 'Which row of letters follows the pattern: OTTFFSS...',
    choices: ['ENTE', 'ENTT', 'ENET', 'TTEN'],
    answerIndex: 0,
    explanation: 'One, Two, Three, Four, Five, Six, Seven, then Eight, Nine, Ten, Eleven',
  },
  {
    id: 'puz_006',
    category: 'puzzles',
    prompt: 'There are 3 apples and you take 2. How many apples do YOU have?',
    choices: ['1', '2', '3', '5'],
    answerIndex: 1,
    explanation: 'You TOOK 2 apples, so you have 2!',
  },
  {
    id: 'puz_007',
    category: 'puzzles',
    prompt: 'A doctor gives you 3 pills and says take one every half hour. How long until they\'re gone?',
    choices: ['30 min', '1 hour', '1.5 hours', '2 hours'],
    answerIndex: 1,
    explanation: 'Take at minute 0, 30, 60. Total = 1 hour.',
  },
];

export const RIDDLE_QUESTIONS: Question[] = [
  {
    id: 'rid_001',
    category: 'riddles',
    prompt: 'What can run but never walks, has a mouth but never talks, has a head but never weeps?',
    choices: ['A clock', 'A river', 'A train', 'A road'],
    answerIndex: 1,
    explanation: 'A river runs, has a mouth (where it meets the sea), and a head (source).',
  },
  {
    id: 'rid_002',
    category: 'riddles',
    prompt: 'I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?',
    choices: ['A shadow', 'An echo', 'A ghost', 'Music'],
    answerIndex: 1,
    explanation: 'An echo speaks (repeats sound) without a mouth, and needs air to travel.',
  },
  {
    id: 'rid_003',
    category: 'riddles',
    prompt: 'The more you have of me, the less you see. What am I?',
    choices: ['Light', 'Darkness', 'Silence', 'Fog'],
    answerIndex: 1,
    explanation: 'The more darkness there is, the less you can see.',
  },
  {
    id: 'rid_004',
    category: 'riddles',
    prompt: 'What gets wetter the more it dries?',
    choices: ['Rain', 'A towel', 'A sponge', 'A cloud'],
    answerIndex: 1,
    explanation: 'A towel gets wetter and wetter as it dries things off.',
  },
  {
    id: 'rid_005',
    category: 'riddles',
    prompt: 'I have hands but can\'t clap. I have a face but no eyes. What am I?',
    choices: ['A puppet', 'A clock', 'A doll', 'A statue'],
    answerIndex: 1,
    explanation: 'A clock has hands (hour/minute) and a face, but no eyes.',
  },
  {
    id: 'rid_006',
    category: 'riddles',
    prompt: 'What is always in front of you but can\'t be seen?',
    choices: ['Air', 'The future', 'Nothing', 'Your face'],
    answerIndex: 1,
    explanation: 'The future is always ahead of you but can never be seen.',
  },
  {
    id: 'rid_007',
    category: 'riddles',
    prompt: 'What has to be broken before you can use it?',
    choices: ['A lock', 'An egg', 'A seal', 'A code'],
    answerIndex: 1,
    explanation: 'You have to break an egg before you can cook with it.',
  },
];

export const ALL_QUESTIONS: Question[] = [
  ...MEMORY_QUESTIONS,
  ...MATH_QUESTIONS,
  ...PUZZLE_QUESTIONS,
  ...RIDDLE_QUESTIONS,
];

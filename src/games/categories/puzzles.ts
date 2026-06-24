/**
 * Puzzles category: logic, spatial, and pattern-recognition challenges.
 *
 * WHY LOGIC & PATTERN PUZZLES WORK:
 * Logic puzzles and visual pattern recognition engage the prefrontal cortex
 * (PFC) and parietal cortex in tandem, activating neural circuits associated
 * with fluid intelligence (Raven's Progressive Matrices directly measure this).
 * Research by Kane & Engle (2002) links PFC-mediated inhibitory control to
 * performance on logic puzzles, the same control needed to resist impulses
 * like social-media scrolling. Spatial reasoning puzzles also activate the
 * right hemisphere parietal regions; training these has shown near-transfer to
 * mathematical skill (Uttal et al., 2013 meta-analysis, n > 10,000).
 *
 * CONTENT NOTE: All questions are original. Inspired by classical puzzle
 * genres (river-crossing, syllogisms, odd-one-out, 2D rotation) but fully
 * rewritten. No puzzles from licensed collections (e.g. Mensa, IQ test books)
 * are reproduced.
 */

import { Question } from '../types';

export const puzzlesQuestions: Question[] = [
  // ── Odd-one-out / classification ─────────────────────────────────────────
  {
    id: 'puz-001',
    category: 'puzzles',
    prompt:
      'Which one does NOT belong?\nDog, Eagle, Salmon, Bat, Penguin',
    choices: ['Salmon', 'Eagle', 'Bat', 'Penguin'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Dog, Eagle, Bat, and Penguin are all warm-blooded vertebrates (mammals or birds). Salmon is a cold-blooded fish: the odd one out.',
  },
  {
    id: 'puz-002',
    category: 'puzzles',
    prompt:
      'Which of the following is different?\n4, 9, 16, 25, 35',
    choices: ['35', '16', '9', '25'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '4=2², 9=3², 16=4², 25=5². All are perfect squares. 35 is not (√35 ≈ 5.92). Pattern recognition: identifying the rule and the violation.',
  },
  {
    id: 'puz-003',
    category: 'puzzles',
    prompt:
      'Odd one out (shapes):\nCircle, Sphere, Square, Triangle, Pentagon',
    choices: ['Sphere', 'Circle', 'Square', 'Pentagon'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Circle, Square, Triangle, and Pentagon are all flat 2D shapes. Sphere is the only 3D shape, so it is the odd one out.',
  },
  {
    id: 'puz-004',
    category: 'puzzles',
    prompt:
      'Which letter does NOT fit?\nB, D, F, H, I, J',
    choices: ['I', 'B', 'D', 'J'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'B, D, F, H, J are all consonants. I is the only vowel. Rapid category scanning under set-switching is an executive function challenge.',
  },

  // ── Logical deduction / syllogisms ──────────────────────────────────────
  {
    id: 'puz-005',
    category: 'puzzles',
    prompt:
      'All Flurps are Blops.\nSome Blops are Grinks.\nCan we conclude: "Some Flurps are definitely Grinks"?',
    choices: ['No', 'Yes', 'Only if Flurps are blue', 'We need more information'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      '"All Flurps are Blops" tells us Flurps ⊆ Blops. "Some Blops are Grinks" means the Grink subset might or might not overlap with Flurps. We cannot conclude any Flurp is a Grink. Classic Euler-diagram syllogism.',
  },
  {
    id: 'puz-006',
    category: 'puzzles',
    prompt:
      'If all squares have four sides, and shape X has four sides,\ncan we conclude shape X is a square?',
    choices: ['No', 'Yes', 'Only if X has equal sides', 'Yes, always'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'This is the fallacy of affirming the consequent. Rectangles, rhombuses, and trapezoids also have four sides. Having four sides is necessary but not sufficient for being a square.',
  },
  {
    id: 'puz-007',
    category: 'puzzles',
    prompt:
      'Three boxes: Box A is heavier than Box B. Box B is heavier than Box C.\nWhich box is lightest?',
    choices: ['Box C', 'Box A', 'Box B', 'Cannot tell'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A > B > C. Transitive reasoning: Box C is the lightest. This is a foundational deductive inference exercise.',
  },
  {
    id: 'puz-008',
    category: 'puzzles',
    prompt:
      'Alex is older than Jordan. Jordan is older than Quinn. Sam is older than Alex.\nWho is the YOUNGEST?',
    choices: ['Quinn', 'Jordan', 'Alex', 'Sam'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Sam > Alex > Jordan > Quinn. Quinn is youngest. Multi-step relational reasoning requires holding and updating an ordered mental model.',
  },
  {
    id: 'puz-009',
    category: 'puzzles',
    prompt:
      'A farmer has 17 sheep. All but 9 die.\nHow many sheep does the farmer have left?',
    choices: ['9', '8', '17', '0'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '"All but 9" means 9 survive. This is a classic misdirection puzzle: the phrasing tricks the brain into subtracting unnecessarily.',
  },
  {
    id: 'puz-010',
    category: 'puzzles',
    prompt:
      'Five people sit in a row: Ana is to the left of Ben. Carlos is to the right of Ben. Dana is to the left of Ana. Eve sits immediately to the right of Ben.\nWho sits in the MIDDLE (3rd position)?',
    choices: ['Ben', 'Ana', 'Carlos', 'Eve'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'The only order that fits every clue is Dana, Ana, Ben, Eve, Carlos. The middle (3rd) seat is Ben.',
  },

  // ── Pattern completion / sequences (non-numeric) ─────────────────────────
  {
    id: 'puz-011',
    category: 'puzzles',
    prompt:
      'Pattern: AZ, BY, CX, DW, ?\nWhat comes next?',
    choices: ['EV', 'EU', 'FV', 'EW'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Forward alphabet (A,B,C,D,E…) paired with backward alphabet (Z,Y,X,W,V…). Next pair: EV.',
  },
  {
    id: 'puz-012',
    category: 'puzzles',
    prompt:
      'What comes next in the sequence?\n1, 1, 2, 3, 5, 8, 13, ?',
    choices: ['21', '18', '20', '15'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'This is the Fibonacci sequence: each term is the sum of the two preceding. 8 + 13 = 21.',
  },
  {
    id: 'puz-013',
    category: 'puzzles',
    prompt:
      'Shape rule: ○ → □ → △ → ○ → □ → △ → ○ → ?\nWhat shape comes next?',
    choices: ['□', '△', '○', 'No pattern'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The cycle repeats every 3 shapes. After ○ comes □. Detecting periodic cycles is a foundational pattern-recognition skill.',
  },
  {
    id: 'puz-014',
    category: 'puzzles',
    prompt:
      'Number pattern: 3, 6, 12, 24, 48, ?\nWhat is the missing number?',
    choices: ['96', '72', '60', '84'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Each term doubles. 48 × 2 = 96. Geometric sequences engage multiplicative reasoning.',
  },
  {
    id: 'puz-015',
    category: 'puzzles',
    prompt:
      'Letter values: A=1, B=2, C=3 … Z=26.\nWhat is the value of the word "CAB"?',
    choices: ['6', '7', '5', '8'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'C=3, A=1, B=2. Sum = 6. Code-mapping exercises require simultaneous recall of a lookup table and arithmetic, creating a high working-memory load.',
  },
  {
    id: 'puz-016',
    category: 'puzzles',
    prompt:
      'What is the NEXT number?\n100, 91, 83, 76, 70, ?',
    choices: ['65', '64', '66', '67'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Differences: −9, −8, −7, −6 → next difference is −5. 70 − 5 = 65. Second-difference sequences require detecting a meta-pattern.',
  },
  {
    id: 'puz-017',
    category: 'puzzles',
    prompt:
      'Matrix pattern: Top row: [2, 4, 8]. Middle row: [3, 6, 12]. Bottom row: [5, 10, ?]\nWhat is the missing value?',
    choices: ['20', '15', '25', '18'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Each row doubles across columns: ×2, ×4 from the first value. 5×2=10, 5×4=20. Matrix reasoning is the basis of Raven\'s Progressive Matrices IQ tests.',
  },

  // ── Spatial / visual reasoning ───────────────────────────────────────────
  {
    id: 'puz-018',
    category: 'puzzles',
    prompt:
      'A cube has 6 faces. If you paint all faces RED and then cut it into 27 equal smaller cubes, how many small cubes have NO red faces?',
    choices: ['1', '8', '0', '6'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Only the single cube at the very centre has no painted faces (it was never on the outside). Spatial decomposition of a 3D object is a classic right-hemisphere visuospatial challenge.',
  },
  {
    id: 'puz-019',
    category: 'puzzles',
    prompt:
      'If you fold a piece of paper in half 3 times, how many layers does it have?',
    choices: ['8', '6', '9', '12'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Each fold doubles the layers: 1→2→4→8. Three folds = 8 layers. Exponential growth via spatial manipulation.',
  },
  {
    id: 'puz-020',
    category: 'puzzles',
    prompt:
      'Looking at a clock at 3:00, the minute hand points straight up. After 20 minutes, how many degrees has the minute hand moved?',
    choices: ['120°', '90°', '60°', '180°'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'The minute hand completes 360° in 60 minutes = 6° per minute. 20 × 6 = 120°. Angular reasoning combines spatial and arithmetic thinking.',
  },
  {
    id: 'puz-021',
    category: 'puzzles',
    prompt:
      'A 3×3 grid has 9 squares. How many RECTANGLES (including squares) can be found in it?',
    choices: ['36', '18', '9', '24'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'To form a rectangle, choose 2 of the 4 horizontal lines and 2 of the 4 vertical lines: C(4,2) × C(4,2) = 6 × 6 = 36. Combinatorial spatial counting is an advanced spatial-reasoning skill.',
  },
  {
    id: 'puz-022',
    category: 'puzzles',
    prompt:
      'A snail climbs a 10-metre pole. It climbs 3 metres during the day but slides 2 metres at night. How many days does it take to reach the top?',
    choices: ['8', '7', '10', '9'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Net progress: 1 m/day. But on day 8 the snail reaches 3×8=24 m... wait, let\'s recalculate: Start of each day it is at: Day1 start=0, ends day=3, ends night=1; Day2=1→4→2; Day3=2→5→3; …Day8=7→10. On day 8 it reaches 10 m during the day phase and doesn\'t slide back. Answer: 8 days.',
  },
  {
    id: 'puz-023',
    category: 'puzzles',
    prompt:
      'You have two ropes. Each burns completely in exactly 60 minutes (but unevenly). How do you measure exactly 45 minutes?',
    choices: [
      'Light rope 1 at both ends and rope 2 at one end; when rope 1 burns out (30 min), light the other end of rope 2',
      'Burn rope 1 fully, then rope 2 halfway',
      'Burn both ropes from one end simultaneously',
      'Cut rope 2 to three-quarters length',
    ],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Rope 1 burning from both ends = 30 min. At that point rope 2 has 30 min remaining. Light rope 2\'s other end → it burns in 15 more min. Total: 30 + 15 = 45 min. Classic lateral-constraint puzzle requiring creative rule use.',
  },

  // ── Constraint / river-crossing style ────────────────────────────────────
  {
    id: 'puz-024',
    category: 'puzzles',
    prompt:
      'A woman has a fox, a chicken, and a bag of grain. She can only carry one at a time across a river. The fox eats the chicken if left alone together. The chicken eats the grain if left alone together. What does she take FIRST?',
    choices: ['Chicken', 'Fox', 'Grain', 'It doesn\'t matter'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'She must take the chicken first. Only leaving fox+grain together is safe. If she takes fox or grain first, the chicken eats the grain or is eaten by the fox. Classic constraint-satisfaction puzzle.',
  },
  {
    id: 'puz-025',
    category: 'puzzles',
    prompt:
      'Three switches downstairs control three bulbs in a room upstairs. You can only go upstairs once. How can you identify all three switches?\n\nA. Turn switch 1 on for 10 min, turn it off; turn switch 2 on; go upstairs.\nB. Flip all three and run upstairs fast.\nC. Go up first to observe, then come down to flip.\nD. Ask a friend to observe.',
    choices: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Strategy A works because: the hot bulb = switch 1 (was on). The lit bulb = switch 2 (still on). The cold, dark bulb = switch 3. Using heat as a secondary signal is lateral thinking, exploiting a non-obvious property of the system.',
  },

  // ── Word / analogy puzzles ────────────────────────────────────────────────
  {
    id: 'puz-026',
    category: 'puzzles',
    prompt:
      'Analogy: Book is to Library as Painting is to ___',
    choices: ['Gallery', 'Artist', 'Frame', 'Colour'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A Book is stored/displayed in a Library. A Painting is stored/displayed in a Gallery. Analogical reasoning requires mapping relational structure across domains.',
  },
  {
    id: 'puz-027',
    category: 'puzzles',
    prompt:
      'Analogy: Gloves are to Hands as Helmet is to ___',
    choices: ['Head', 'Neck', 'Shoulders', 'Feet'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Gloves protect and cover Hands. A Helmet protects and covers the Head. Structural analogy mapping.',
  },
  {
    id: 'puz-028',
    category: 'puzzles',
    prompt:
      'If APPLE can be coded as BQQMF (shift each letter +1), what does DBUF decode to?',
    choices: ['CATE', 'DATE', 'BATE', 'FATE'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Shifting each letter back by 1: D−1=C, B−1=A, U−1=T, F−1=E → CATE. Cryptographic substitution requires holding and applying a transformation rule.',
  },
  {
    id: 'puz-029',
    category: 'puzzles',
    prompt:
      'What 4-letter word can be placed BEFORE each of these words to make new words?\n___ SIDE, ___ WAY, ___ DOOR, ___ STEP',
    choices: ['BACK', 'OUT', 'SIDE', 'DOOR'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'BACK: BACKSIDE ✓, BACKWAY ✓, BACKDOOR ✓, BACKSTEP ✓. All four work. Compound word generation requires simultaneous constraint satisfaction across multiple slots in the mental lexicon.',
  },
  {
    id: 'puz-030',
    category: 'puzzles',
    prompt:
      'Find the hidden word: the last two letters of the first word are the first two letters of the second.\nStar__ + __ion = ?\nWhat word fills the gap?',
    choices: ['Startion', 'Station', 'Ration', 'Staring'],
    answerIndex: 1,
    difficulty: 'easy',
    explanation:
      'Star + tion = Station. The shared letters are "ti" from Star(ti) and (ti)on. Word-bridging activates phonological and orthographic processing simultaneously.',
  },
  {
    id: 'puz-031',
    category: 'puzzles',
    prompt:
      'How many triangles are in this description:\n"A large triangle contains 4 smaller equal triangles inside it, one in each corner and one in the middle."\nTotal triangles (counting all sizes)?',
    choices: ['5', '4', '6', '9'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      '4 small triangles + 1 large triangle = 5 total. Counting overlapping shapes at multiple scales is a visuospatial parsing task.',
  },
  {
    id: 'puz-032',
    category: 'puzzles',
    prompt:
      'Exactly one of these statements is true.\n(A) Statement A is true.\n(B) Statement A is false.\n(C) Statement B is false.\n\nWhich statement is the true one?',
    choices: ['C', 'A', 'B', 'None'],
    answerIndex: 2,
    difficulty: 'hard',
    explanation:
      'Test B: if B ("A is false") is true, then A is false (fine, since A only claims itself true) and C ("B is false") is false. That leaves exactly one true statement, B. Making A the true one or C the true one each forces a second statement to be true as well, breaking the "exactly one" rule. So the true statement is B.',
  },
];

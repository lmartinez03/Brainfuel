/**
 * Memory category: working memory and recall challenges.
 *
 * WHY MEMORY GAMES WORK:
 * Working memory training activates the dorsolateral prefrontal cortex and
 * parietal regions. N-back style recall tasks and sequence retention exercises
 * have shown transfer to fluid reasoning in multiple studies (Jaeggi et al.,
 * 2008; Klingberg, 2010). Even brief recall challenges (like the ones here)
 * require the user to hold and manipulate information mentally, exercising the
 * phonological loop and visuospatial sketchpad components of Baddeley's
 * working memory model.
 *
 * FORMAT: Multiple-choice recall questions, pattern/sequence recall, and
 * "what changed?" style questions. All content is original and authored for
 * Brainfuel. No third-party question sets used.
 *
 * ANTI-CHEAT: recall questions put the material to remember in `memorize`, not
 * `prompt`. The quiz reveals it first, then hides it before showing the
 * question, so the answer cannot be re-read while choosing. Pure pattern
 * questions (where the sequence IS the puzzle) keep everything in `prompt`.
 */

import { Question } from '../types';

export const memoryQuestions: Question[] = [
  {
    id: 'mem-001',
    category: 'memory',
    memorize: 'A sequence of numbers:\n\n7   2   9   4   1',
    prompt: 'Which number appeared in the THIRD position?',
    choices: ['9', '2', '4', '7'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The sequence was 7, 2, 9, 4, 1. Position three is 9. Short-term serial recall is a classic working-memory benchmark.',
  },
  {
    id: 'mem-002',
    category: 'memory',
    memorize: 'A list of words:\n\nRED   CIRCLE   SEVEN   APPLE   NORTH',
    prompt: 'Which word was in the SECOND position?',
    choices: ['SEVEN', 'CIRCLE', 'APPLE', 'RED'],
    answerIndex: 1,
    difficulty: 'easy',
    explanation:
      'The second word was CIRCLE. Mixed-category lists are harder to chunk, making recall more effortful.',
  },
  {
    id: 'mem-003',
    category: 'memory',
    memorize: 'A short list of numbers:\n\n3   8   1   6   4   9',
    prompt: 'What is the SUM of the first and last numbers?',
    choices: ['12', '11', '7', '10'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'First number = 3, last number = 9. 3 + 9 = 12. This requires both recall AND mental arithmetic, hitting two cognitive domains.',
  },
  {
    id: 'mem-004',
    category: 'memory',
    memorize: 'Five words:\n\nPINE   OCEAN   LAMP   BRIDGE   COIN',
    prompt: 'How many of these words refer to a man-made object?',
    choices: ['3', '2', '1', '4'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'LAMP, BRIDGE, and COIN are man-made (3 items). PINE and OCEAN are natural. This requires categorisation while holding items in working memory.',
  },
  {
    id: 'mem-005',
    category: 'memory',
    memorize: 'A sequence of shapes:\n\n★  □  ○  ★  □  ★  ○  □',
    prompt: 'How many times does ★ appear?',
    choices: ['3', '2', '4', '1'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: '★ appears at positions 1, 4, and 6: three times in total.',
  },
  {
    id: 'mem-006',
    category: 'memory',
    memorize: '"The blue car parked beside a tall oak tree at noon on Friday."',
    prompt: 'What colour was the car?',
    choices: ['Blue', 'Red', 'Silver', 'Black'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The sentence states "blue car". Even simple sentence recall activates episodic memory and attention.',
  },
  {
    id: 'mem-007',
    category: 'memory',
    memorize: '"Emma visited 4 cities: Tokyo, Oslo, Lima, and Cairo."',
    prompt: 'Which city was THIRD in the list?',
    choices: ['Lima', 'Oslo', 'Cairo', 'Tokyo'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Tokyo (1st), Oslo (2nd), Lima (3rd), Cairo (4th). Serial position recall is a fundamental memory exercise.',
  },
  {
    id: 'mem-008',
    category: 'memory',
    memorize: 'The top row of a grid:\n\n| 5 | 8 | 3 | 7 |',
    prompt: 'What was the value in column 3?',
    choices: ['3', '8', '7', '5'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The top row was 5, 8, 3, 7. Column 3 (0-indexed: column 2) holds 3.',
  },
  {
    id: 'mem-009',
    category: 'memory',
    memorize: 'Items in a bag:\n\nkeys, wallet, phone, umbrella, charger',
    prompt: 'Which item starts with a VOWEL?',
    choices: ['umbrella', 'keys', 'wallet', 'phone'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '"umbrella" starts with the vowel U. All the others start with consonants. Scanning held items for a property exercises selective attention within working memory.',
  },
  {
    id: 'mem-010',
    category: 'memory',
    memorize: '"Sam had 5 apples. He gave 2 to Maria and bought 3 more."',
    prompt: 'How many apples does Sam have now?',
    choices: ['6', '5', '8', '3'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '5 − 2 + 3 = 6. Narrative arithmetic requires you to track changing quantities in your working memory, creating a dual-task cognitive load.',
  },
  {
    // Pattern question: the sequence is the puzzle, so it stays on screen.
    id: 'mem-011',
    category: 'memory',
    prompt: 'Letter sequence: A, F, B, G, C, H\nWhat letter would logically come NEXT?',
    choices: ['D', 'I', 'E', 'J'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Two interleaved sequences: A,B,C,D… and F,G,H,I… The next letter in the first sequence is D.',
  },
  {
    id: 'mem-012',
    category: 'memory',
    memorize: 'A colour sequence:\n\nRed, Blue, Red, Green, Blue, Red, Blue, Green',
    prompt: 'How many BLUE entries are there?',
    choices: ['3', '2', '4', '1'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Blue appears at positions 2, 5, and 7: three times. Counting items within a held sequence exercises the phonological loop.',
  },
  {
    id: 'mem-013',
    category: 'memory',
    memorize: 'A word list:\n\nMANGO   PIANO   TIGER   CLOUD   BRIDGE',
    prompt: 'Which word is associated with an animal?',
    choices: ['TIGER', 'CLOUD', 'PIANO', 'MANGO'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'TIGER is the only animal in the list. Semantic categorisation during recall is a working memory strategy called "elaborative encoding".',
  },
  {
    id: 'mem-014',
    category: 'memory',
    memorize: 'A phone number:\n\n0491 750 208',
    prompt: 'What are the LAST three digits?',
    choices: ['208', '750', '491', '049'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'The last three digits are 208. Phone numbers are a classic test of phonological working-memory capacity.',
  },
  {
    id: 'mem-015',
    category: 'memory',
    memorize: '"The meeting is at 3 pm in Room 12 on the second floor."',
    prompt: 'On which floor is the meeting?',
    choices: ['Second', 'Third', 'First', 'Ground'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The passage states "second floor". Prospective memory tasks like remembering location and time have everyday relevance.',
  },
  {
    id: 'mem-016',
    category: 'memory',
    memorize: 'Pairs to remember:\n\nCat/Blue, Dog/Red, Bird/Green, Fish/Yellow',
    prompt: 'What colour was paired with Dog?',
    choices: ['Red', 'Blue', 'Yellow', 'Green'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Dog was paired with Red. Paired-associate learning is a classical test of declarative (episodic) memory.',
  },
  {
    // Pattern question: the sequence is the puzzle, so it stays on screen.
    id: 'mem-017',
    category: 'memory',
    prompt: 'Sequence: 2, 4, 8, 16, ?\nWhat comes next?',
    choices: ['32', '24', '20', '18'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Each term doubles: 2×2=4, 4×2=8, 8×2=16, 16×2=32. Pattern completion requires you to hold and transform the sequence in working memory.',
  },
  {
    id: 'mem-018',
    category: 'memory',
    memorize:
      '"Lisa drove north for 10 km, then turned east for 5 km, then south for 10 km."',
    prompt: 'In which direction is she from her starting point?',
    choices: ['East', 'West', 'North', 'She is back at start'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'North 10 km then south 10 km cancels out. She only moved east 5 km, so she is due East of the start. Spatial working memory is exercised by tracking movement mentally.',
  },
  {
    id: 'mem-019',
    category: 'memory',
    memorize: 'Shapes in order:\n\nTRIANGLE, SQUARE, CIRCLE, SQUARE, TRIANGLE',
    prompt: 'Did CIRCLE appear before or after the second SQUARE?',
    choices: ['Before', 'After', 'At the same time', 'CIRCLE did not appear'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Order: Triangle(1), Square(2), Circle(3), Square(4), Triangle(5). Circle is position 3, second Square is position 4, so Circle appears before.',
  },
  {
    id: 'mem-020',
    category: 'memory',
    memorize: 'A number:\n\n8  3  1  5  9  2  7  4',
    prompt: 'What is the digit in the FIFTH position?',
    choices: ['9', '5', '2', '7'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Positions: 8(1), 3(2), 1(3), 5(4), 9(5). Position five is 9. Eight-digit spans exceed average working memory capacity (~7±2), making this genuinely challenging.',
  },
  {
    id: 'mem-021',
    category: 'memory',
    memorize: 'A grocery list:\n\nmilk, eggs, bread, butter, cheese, yogurt',
    prompt: 'How many DAIRY items are in the list?',
    choices: ['4', '3', '5', '2'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Dairy items: milk, butter, cheese, yogurt (4 items). Bread is grain; eggs are poultry. Semantic categorisation while holding a list trains executive function.',
  },
  {
    // Logic question: reversing a well-known sequence, nothing to hide.
    id: 'mem-022',
    category: 'memory',
    prompt:
      'The alphabet backwards starting from Z: Z, Y, X, W, V, U, T…\nWhat is the 8th letter in this reverse sequence?',
    choices: ['S', 'T', 'R', 'U'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Z(1),Y(2),X(3),W(4),V(5),U(6),T(7),S(8). The 8th reverse letter is S. Reversing well-known sequences is a classic executive-function test.',
  },
  {
    id: 'mem-023',
    category: 'memory',
    memorize: '"Jake scored 45 in the first game and 38 in the second game."',
    prompt: 'By how many points did his second score differ from his first?',
    choices: ['7', '8', '3', '12'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '45 − 38 = 7. Arithmetic on memorised values combines verbal recall with mental computation.',
  },
  {
    // Pattern question: the pairs are the clue, so they stay on screen.
    id: 'mem-024',
    category: 'memory',
    prompt:
      'Pairs: Sun→Hot, Ice→Cold, Lemon→Sour, Sugar→Sweet, Salt→?\nComplete the pair for Salt.',
    choices: ['Salty', 'Bitter', 'Sweet', 'Spicy'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Salt is associated with the Salty flavour (the fifth primary taste). Completing predictable pairs is pattern recall.',
  },
  {
    id: 'mem-025',
    category: 'memory',
    memorize: 'Grid positions:\n\nA1=Star, B2=Moon, C3=Sun, A3=Cloud',
    prompt: 'What symbol is at position B2?',
    choices: ['Moon', 'Star', 'Sun', 'Cloud'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'B2 = Moon. Spatial grid recall activates the visuospatial sketchpad, one of the two slave systems in Baddeley\'s working memory model.',
  },
  {
    // Pattern question: compound-word chain is the puzzle, stays on screen.
    id: 'mem-026',
    category: 'memory',
    prompt:
      'Word chain: FIRE → PLACE → MAT → MATCH → STICK → ?\nWhat word logically extends this chain?',
    choices: ['Bug', 'Stone', 'Line', 'Trunk'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Each word pairs with the next: FIRE+PLACE, PLACE+MAT, MAT+MATCH, MATCH+STICK, STICK+BUG (stickbug). Compound-word chaining requires simultaneous forward and backward recall.',
  },
  {
    id: 'mem-027',
    category: 'memory',
    memorize: '"The red fox leapt over a blue stream and hid in the green bushes."',
    prompt: 'How many colours are mentioned?',
    choices: ['3', '2', '4', '1'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Red, Blue, Green: three colours. Colour-counting while processing semantic content is a divided-attention working memory task.',
  },
  {
    id: 'mem-028',
    category: 'memory',
    memorize: 'A sequence to hold:\n\n6, 1, 8, 3, 5',
    prompt: 'Reverse it mentally. What is the SECOND number in the reversed sequence?',
    choices: ['3', '5', '8', '6'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Original: 6,1,8,3,5. Reversed: 5,3,8,1,6. The second element is 3. Mental reversal is the "backward digit span" task used in clinical cognitive assessment.',
  },
  {
    id: 'mem-029',
    category: 'memory',
    memorize:
      'A schedule:\n\nMonday = Gym\nTuesday = Library\nWednesday = Gym\nThursday = Rest\nFriday = Library',
    prompt: 'On how many days does the Library appear?',
    choices: ['2', '1', '3', '0'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Library is on Tuesday and Friday: 2 days. Schedule tracking is a form of prospective working memory.',
  },
  {
    id: 'mem-030',
    category: 'memory',
    memorize: 'Three-letter codes:\n\nALT, BKM, CRQ, DZP',
    prompt: 'What is the MIDDLE letter of the THIRD code?',
    choices: ['R', 'K', 'Z', 'L'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Third code = CRQ. Middle letter = R. Holding alphanumeric codes and indexing them requires high phonological loop capacity.',
  },
];

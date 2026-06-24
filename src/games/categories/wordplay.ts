/**
 * Wordplay category: verbal reasoning, anagrams, homophones, vocabulary.
 *
 * WHY VERBAL / WORDPLAY TASKS WORK:
 * Language-based cognitive tasks engage the left-hemisphere perisylvian
 * language network (Broca's and Wernicke's areas) as well as the prefrontal
 * cortex during semantic search. Research shows that verbal fluency training
 * (anagram solving, synonym generation) increases functional connectivity
 * between frontal and temporal regions (Gernsbacher & Kaschak, 2003).
 * Additionally, phonological manipulation tasks (e.g. pig latin, syllable
 * reversal) are among the most sensitive probes of phonological working
 * memory, the same system implicated in reading, language acquisition, and
 * attention regulation (Baddeley, 2003).
 *
 * CONTENT NOTE: All wordplay questions are original. No licensed word-game
 * content (e.g. NYT games, Scrabble word lists under license) is used.
 * Standard English vocabulary and common word patterns are in the public
 * domain.
 */

import { Question } from '../types';

export const wordplayQuestions: Question[] = [
  // ── Anagrams ──────────────────────────────────────────────────────────────
  {
    id: 'wrd-001',
    category: 'wordplay',
    prompt: 'Which word is an anagram of LISTEN (uses exactly the same letters)?',
    choices: ['SILENT', 'STOLEN', 'LINERS', 'TONERS'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'SILENT uses exactly L,I,S,T,E,N, the same letters as LISTEN. STOLEN, LINERS, and TONERS each differ by at least one letter, so SILENT is the only anagram.',
  },
  {
    id: 'wrd-002',
    category: 'wordplay',
    prompt: 'ASTRONOMER is an anagram of which phrase?',
    choices: ['MOON STARER', 'STAR GAZER', 'MARS WATCHER', 'MOON WALKER'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'ASTRONOMER uses the letters A,E,M,N,O,O,R,R,S,T, which rearrange exactly to MOON STARER. The other space-themed phrases use different letters, so they are not anagrams.',
  },
  {
    id: 'wrd-003',
    category: 'wordplay',
    prompt: 'Which word is an anagram of EARTH?',
    choices: ['HEART', 'HATER', 'RATHE', 'All of the above'],
    answerIndex: 3,
    difficulty: 'medium',
    explanation: 'HEART, HATER, and RATHE are all valid anagrams of EARTH (same 5 letters: E,A,R,T,H). This shows that a single set of letters can yield multiple meaningful words.',
  },
  {
    id: 'wrd-004',
    category: 'wordplay',
    prompt: 'DORMITORY rearranged spells which two-word phrase?',
    choices: ['DIRTY ROOM', 'MESSY ROOM', 'TIDY ROOM', 'DARK ROOM'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation: 'DORMITORY uses the letters D,I,M,O,O,R,R,T,Y, which rearrange exactly to DIRTY ROOM. The other phrases use different letters, so only DIRTY ROOM is a true anagram (and an ironic one).',
  },
  {
    id: 'wrd-005',
    category: 'wordplay',
    prompt: 'Unscramble: GANORE',
    choices: ['ORANGE', 'ORACLE', 'ORIGIN', 'ORCHID'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'GANORE rearranges to ORANGE (O,R,A,N,G,E). The other choices share some letters but are not built from exactly these six, so only ORANGE is a valid unscramble.',
  },

  // ── Homophones & double meanings ──────────────────────────────────────────
  {
    id: 'wrd-006',
    category: 'wordplay',
    prompt: 'Which pair are NOT homophones (do NOT sound alike)?\n(A) There / Their\n(B) Know / Now\n(C) Sea / See\n(D) Whose / Who\'s',
    choices: ['C: Sea / See', 'A: There / Their', 'D: Whose / Who\'s', 'B: Know / Now'],
    answerIndex: 3,
    difficulty: 'medium',
    explanation: 'A, C, and D are all homophones (each pair sounds identical). Only B is not: "Know" (/noʊ/) and "Now" (/naʊ/) are pronounced differently. So B is the pair that are NOT homophones.',
  },
  {
    id: 'wrd-007',
    category: 'wordplay',
    prompt: 'Which word can follow both "SUN" and "OVER" to make two valid compound words?\nSUN___ and OVER___',
    choices: ['SET', 'SHINE', 'LIGHT', 'DAY'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'SUNSET ✓ and OVERSET ✓ are both valid English words. "Sunset" = when the sun goes below the horizon. "Overset" = to turn over / upset (also a printing term). This compound-word task requires exhaustive lexical search, activating the mental lexicon.',
  },
  {
    id: 'wrd-008',
    category: 'wordplay',
    prompt: 'What single word can follow "DOWN", "UP", and "OVER" to make three valid compound words?\nDOWN___ / UP___ / OVER___',
    choices: ['LOAD', 'FIRE', 'BACK', 'GROUND'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'DOWNLOAD, UPLOAD, and OVERLOAD are all valid words. None of the other options forms a compound with all three prefixes.',
  },
  {
    id: 'wrd-009',
    category: 'wordplay',
    prompt: 'The word "BUFFALO" repeated 8 times forms a grammatical English sentence. What does it mean?',
    choices: [
      'Bison from Buffalo (NY) that other bison bully, themselves bully other bison',
      'It is nonsense; no sentence can consist of one word repeated',
      'It describes a single buffalo repeating an action',
      'It is a code for something else',
    ],
    answerIndex: 0,
    difficulty: 'hard',
    explanation: '"Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo" is a genuine grammatical sentence. "Buffalo" works as a noun (the animal), a proper noun (the city of Buffalo, NY), and a verb (to bully or confuse). It is a famous example of how grammar alone can be ambiguous.',
  },
  {
    id: 'wrd-010',
    category: 'wordplay',
    prompt: 'What 5-letter word becomes shorter when you add two letters to it?',
    choices: ['SHORT', 'SMALL', 'BRIEF', 'QUICK'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'SHORT + ER = SHORTER. Adding "ER" makes it literally the word "SHORTER." A self-referential wordplay classic.',
  },

  // ── Vocabulary & word definitions ─────────────────────────────────────────
  {
    id: 'wrd-011',
    category: 'wordplay',
    prompt: 'What does "EPHEMERAL" mean?',
    choices: ['Lasting a very short time', 'Deeply meaningful', 'Occurring at night', 'Relating to numbers'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'Ephemeral (from Greek ephēmeros, "lasting a day") means short-lived or transitory. The opposite of what doom-scrolling feels like but what it actually produces.',
  },
  {
    id: 'wrd-012',
    category: 'wordplay',
    prompt: 'Which word is a synonym for LOQUACIOUS?',
    choices: ['Talkative', 'Quiet', 'Logical', 'Graceful'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'Loquacious (from Latin loquax, "talkative") means excessively or freely talkative. Building synonym networks strengthens semantic memory.',
  },
  {
    id: 'wrd-013',
    category: 'wordplay',
    prompt: 'Which word means the fear of long words (ironic word)?',
    choices: ['Hippopotomonstrosesquippedaliophobia', 'Logophobia', 'Verbophobia', 'Lexicophobia'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation: 'Hippopotomonstrosesquippedaliophobia is the (jokingly coined) term for the fear of long words. It is itself one of the longest words in English. An example of metalinguistic humour.',
  },
  {
    id: 'wrd-014',
    category: 'wordplay',
    prompt: 'What word is its own antonym (called a "contronym")?\nExample use: "The wound was left to DRESS" vs "She will DRESS the wound."',
    choices: ['SANCTION', 'CLEAVE', 'DUST', 'All of the above'],
    answerIndex: 3,
    difficulty: 'hard',
    explanation: 'All three are contronyms: SANCTION (to permit OR to penalise), CLEAVE (to split apart OR to cling together), DUST (to remove dust OR to apply a fine powder). These are called Janus words, facing two opposite directions.',
  },
  {
    id: 'wrd-015',
    category: 'wordplay',
    prompt: 'What does the prefix "ANTE-" mean (as in antechamber, antenatal)?',
    choices: ['Before', 'Against', 'Above', 'After'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'Ante- (Latin) = "before." Antechamber = room before the main room; antenatal = before birth. Not to be confused with ANTI- (against).',
  },

  // ── Word chains & riddles ─────────────────────────────────────────────────
  {
    id: 'wrd-016',
    category: 'wordplay',
    prompt: 'Change one letter at a time to turn COLD into WARM (each step is a real word):\nCOLD → CORD → ? → WARD → WARM\nWhat is the missing word?',
    choices: ['WORD', 'CORE', 'WORM', 'WORE'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation: 'COLD → CORD → WORD → WARD → WARM. Between CORD and WARD the only valid single-letter step is WORD (change C to W, then O to A).',
  },
  {
    id: 'wrd-017',
    category: 'wordplay',
    prompt: 'Which word can be added to the FRONT of ACHE, BREAK, and BEAT to make three valid words?',
    choices: ['HEART', 'DAY', 'DRUM', 'OUT'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'HEARTACHE, HEARTBREAK, and HEARTBEAT are all valid words. Each other option fits only one of the three (DAYBREAK, DRUMBEAT, OUTBREAK).',
  },
  {
    id: 'wrd-018',
    category: 'wordplay',
    prompt: 'In the word BOOKKEEPER, how many consecutive double-letter pairs are there?',
    choices: ['3', '2', '4', '1'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'BOOKKEEPER: OO (bo-ok), KK (boo-kk), EE (bookie-ee-per). Three consecutive double-letter pairs, making BOOKKEEPER one of the most unusual words in English orthography.',
  },
  {
    id: 'wrd-019',
    category: 'wordplay',
    prompt: 'Which word contains all five vowels (A, E, I, O, U), each exactly once?',
    choices: ['MOUNTAIN', 'SEQUOIA', 'NOTEBOOK', 'KEYBOARD'],
    answerIndex: 1,
    difficulty: 'medium',
    explanation: 'SEQUOIA (the giant tree) contains A, E, I, O, and U exactly once in just 7 letters. The others are each missing at least one vowel.',
  },
  {
    id: 'wrd-020',
    category: 'wordplay',
    prompt: 'Which sentence is a pangram (contains every letter of the alphabet)?',
    choices: [
      'The quick brown fox jumps over the lazy dog',
      'Pack my box with five dozen liquor jugs',
      'How vexingly quick daft zebras jump',
      'All of the above',
    ],
    answerIndex: 3,
    difficulty: 'medium',
    explanation: 'All three are valid pangrams: each uses every letter A to Z at least once. Pangrams are used to test fonts, keyboards, and as memory anchors. Recognising that multiple answers can be correct requires flexible thinking.',
  },
  {
    id: 'wrd-021',
    category: 'wordplay',
    prompt: 'What is a word for a word that reads the same forwards and backwards?',
    choices: ['Palindrome', 'Anagram', 'Homophone', 'Synonym'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'A palindrome reads the same in both directions: RACECAR, LEVEL, MADAM. The word "palindrome" itself comes from Greek palin (again) + dromos (running).',
  },
  {
    id: 'wrd-022',
    category: 'wordplay',
    prompt: 'Complete the sentence with the correct homophone:\n"The ___ blew for an hour, then the ship set sail." (Air movement vs. not-know)',
    choices: ['wind', 'wynd', 'wined', 'whined'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: '"Wind" (air movement) vs "Whined" (complained). Context clues ("ship set sail") confirm "wind." Using context to disambiguate homophones is a key reading comprehension skill.',
  },
  {
    id: 'wrd-023',
    category: 'wordplay',
    prompt: 'Which of these is NOT a real English word?\n(A) Flibbertigibbet\n(B) Callipygian\n(C) Snollygoster\n(D) Frumptious',
    choices: ['Frumptious', 'Flibbertigibbet', 'Callipygian', 'Snollygoster'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation: '"Frumptious" is not a standard dictionary word (Roald Dahl coined "Scrumdiddlyumptious"; you may be thinking of that). The others are real: flibbertigibbet (a gossipy person), callipygian (having well-shaped buttocks), snollygoster (a shrewd unprincipled politician). Distinguishing real from plausible-sounding words exercises metalexical knowledge.',
  },
  {
    id: 'wrd-024',
    category: 'wordplay',
    prompt: 'What is the technical term for using a milder or vaguer word in place of a harsh one (e.g. "passed away" instead of "died")?',
    choices: ['Euphemism', 'Hyperbole', 'Litotes', 'Dysphemism'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'Euphemism (Greek eu = good + pheme = speech) softens difficult truths. The opposite, dysphemism, makes something sound worse than it is. Understanding rhetorical devices helps resist manipulative language.',
  },
  {
    id: 'wrd-025',
    category: 'wordplay',
    prompt: 'If you remove the first letter from STING, then add it to the end, what new word do you get?',
    choices: ['TINGS', 'STING', 'KINGS', 'RINGS'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'STING → remove S → TING → add S to end → TINGS. Letter rotation is a phonological manipulation task.',
  },
  {
    id: 'wrd-026',
    category: 'wordplay',
    prompt: 'Which word is the odd one out by its spelling pattern?\nRECEIVE, BELIEVE, ACHIEVE, SIEGE',
    choices: ['BELIEVE', 'RECEIVE', 'SIEGE', 'ACHIEVE'],
    answerIndex: 1,
    difficulty: 'medium',
    explanation: 'BELIEVE, ACHIEVE, and SIEGE are all spelled with "IE". RECEIVE is the only one spelled with "EI" (it follows a C, matching "I before E except after C"), so it is the odd one out.',
  },
  {
    id: 'wrd-027',
    category: 'wordplay',
    prompt: 'What do the following have in common?\nMATRESS → MATTRESS\nOCURRENCE → OCCURRENCE\nSEPERATE → SEPARATE\n',
    choices: [
      'They are all common misspellings of English words',
      'They are all antonyms',
      'They are all words with silent letters',
      'They are all borrowed from French',
    ],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'All three are among the most commonly misspelled English words. MATTRESS (double T), OCCURRENCE (double C and double R), SEPARATE (not sepErate; remember "there is A RAT in sepARATe"). Orthographic vigilance is a component of verbal working memory.',
  },
  {
    id: 'wrd-028',
    category: 'wordplay',
    prompt: 'The word "RACE" can become "CARE" by rearranging. What property do RACE and CARE share?',
    choices: ['They are anagrams', 'They are homophones', 'They are synonyms', 'They are palindromes'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: 'RACE and CARE contain the same letters (R,A,C,E) in different orders: they are anagrams. Other anagrams of these four letters: ACRE, ACER.',
  },
  {
    id: 'wrd-029',
    category: 'wordplay',
    prompt: 'What connects these words: BANK, BARK, BAT, FLY?\n(Hint: each word has at least two unrelated meanings)',
    choices: [
      'They are all polysemes: words with multiple unrelated meanings',
      'They all relate to animals',
      'They all have silent letters',
      'They are all onomatopoeia',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation: 'BANK (riverbank / financial bank), BARK (tree bark / dog sound / a type of boat), BAT (cricket bat / flying mammal), FLY (the insect / to fly through air). Polysemy (one word form with multiple meanings) is a hallmark of natural language efficiency.',
  },
  {
    id: 'wrd-030',
    category: 'wordplay',
    prompt: 'What is a word that sounds like a letter of the alphabet?\nExample: "Aisle" sounds like the letter ___',
    choices: ['I', 'A', 'L', 'E'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation: '"Aisle" is pronounced /aɪl/, the same as the letter "I." Other examples: "Are" ≈ R, "Sea" ≈ C, "Why" ≈ Y. These are called letter-homophones and exercise phonemic awareness.',
  },
];

/**
 * Riddles category: lateral thinking and verbal insight challenges.
 *
 * WHY RIDDLES WORK:
 * Riddles and insight problems require breaking fixation on an initial
 * (incorrect) interpretation and restructuring the problem mentally, a
 * process neuroscientists call "representational change." fMRI studies
 * (Bowden & Jung-Beeman, 2003) show a distinct burst of right-hemisphere
 * anterior temporal lobe (right aTL) gamma-wave activity at the moment of
 * "aha" insight. This is cognitively distinct from analytic problem solving
 * and exercises creative, flexible thinking. Lateral thinking riddles also
 * suppress System 1 (fast, automatic) responses in favour of System 2
 * (slow, deliberate) reasoning, exactly the skill needed to resist opening
 * Instagram on autopilot.
 *
 * CONTENT NOTE: Every riddle here is original or a well-established
 * public-domain folk riddle rewritten in new words. No riddles are lifted
 * from commercial puzzle books or licensed collections. See docs/games-research.md.
 */

import { Question } from '../types';

export const riddlesQuestions: Question[] = [
  // ── Classic insight riddles ───────────────────────────────────────────────
  {
    id: 'rid-001',
    category: 'riddles',
    prompt:
      'I have cities but no houses, mountains but no trees, water but no fish, and roads but no cars. What am I?',
    choices: ['A map', 'A dream', 'A painting', 'A desert'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A map represents cities, mountains, water, and roads as symbols. None of the physical things exist within it. Classic misdirection: the listener imagines real places rather than representations of them.',
  },
  {
    id: 'rid-002',
    category: 'riddles',
    prompt:
      'The more you take, the more you leave behind. What am I?',
    choices: ['Footsteps', 'Time', 'Memories', 'Shadows'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Footsteps: every step you take leaves a footprint behind you. The riddle exploits the double meaning of "take."',
  },
  {
    id: 'rid-003',
    category: 'riddles',
    prompt:
      'I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?',
    choices: ['An echo', 'A radio', 'A ghost', 'A telephone'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'An echo: it "speaks" (reflects sound), requires no physical body, and is most clearly heard when there\'s movement through air or open space.',
  },
  {
    id: 'rid-004',
    category: 'riddles',
    prompt:
      'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?',
    choices: ['A river', 'A clock', 'A road', 'A train'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A river: it runs (flows), has a mouth (where it meets the sea), a head (source), and a bed (the bottom). Each clue uses a word with a body/behavior meaning that applies literally to a river.',
  },
  {
    id: 'rid-005',
    category: 'riddles',
    prompt:
      'I am always in front of you but can never be seen. What am I?',
    choices: ['The future', 'Your nose', 'Air', 'A mirror'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The future is always ahead of you in time, but you cannot observe it directly.',
  },
  {
    id: 'rid-006',
    category: 'riddles',
    prompt:
      'David\'s father has five sons: Nana, Nene, Nini, Nono, and ___?\nWhat is the fifth son\'s name?',
    choices: ['David', 'Nunu', 'Nano', 'Nidi'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The riddle tells you: "David\'s father has five sons." David is one of those sons. The pattern (Nana, Nene…) is a red herring designed to make you continue it to "Nunu."',
  },
  {
    id: 'rid-007',
    category: 'riddles',
    prompt:
      'You are in a room with no windows or doors. The floor, walls, and ceiling are all made of solid steel. How do you get out?',
    choices: [
      'Stop imagining you\'re there',
      'Dig through the floor',
      'Shout for help',
      'Wait for rust to weaken the walls',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'A meta-riddle: the scenario is hypothetical ("you are in a room"). Stopping the thought exits the imaginary room. Lateral thinking: challenge the premise rather than solving within its constraints.',
  },
  {
    id: 'rid-008',
    category: 'riddles',
    prompt:
      'What has hands but cannot clap?',
    choices: ['A clock', 'A glove', 'A statue', 'A scarecrow'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A clock has hands (hour/minute/second hands) but cannot clap because they are rigid mechanical arms, not human hands.',
  },
  {
    id: 'rid-009',
    category: 'riddles',
    prompt:
      'What gets wetter as it dries?',
    choices: ['A towel', 'A sponge', 'Sand', 'A cloud'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A towel absorbs water as it dries things, so it gets wetter in the process of drying. The word "dries" is deliberately ambiguous (the thing being dried vs. the towel drying out).',
  },
  {
    id: 'rid-010',
    category: 'riddles',
    prompt:
      'I have a neck but no head, and I wear a cap. What am I?',
    choices: ['A bottle', 'A guitar', 'A mushroom', 'A shirt'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A bottle has a neck (narrow top section), no head, and is sealed with a cap. Body-part metaphors applied to objects are classic riddle misdirection.',
  },
  {
    id: 'rid-011',
    category: 'riddles',
    prompt:
      'The day before two days after the day before yesterday is Saturday. What day is today?',
    choices: ['Sunday', 'Friday', 'Thursday', 'Saturday'],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Let T = today. "Day before yesterday" = T−2. "Two days after (T−2)" = T−2+2 = T. "The day before T" = T−1. So T−1 = Saturday, meaning T = Sunday. Today is Sunday. The convoluted phrasing is designed to exhaust working memory during parsing. The cognitive struggle IS the exercise.',
  },
  {
    id: 'rid-012',
    category: 'riddles',
    prompt:
      'A rooster lays an egg on top of a triangular barn roof. Which side does it roll off?',
    choices: ['Roosters don\'t lay eggs', 'Left', 'Right', 'It stays on top'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Roosters are male chickens and do not lay eggs. The question assumes the premise without you noticing the impossibility. Detecting false premises requires careful reading, a metacognitive skill.',
  },
  {
    id: 'rid-013',
    category: 'riddles',
    prompt:
      'A woman shoots her husband, then holds him underwater for five minutes. Twenty minutes later they go out to dinner. How is this possible?',
    choices: [
      'She is a photographer: she "shot" his photo and developed it in the darkroom',
      'He is wearing a bulletproof vest',
      'It was a dream',
      'She missed the shot',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      '"Shot" = took a photograph. "Holds him underwater" = developing the photo in the darkroom tray. This lateral thinking riddle requires escaping the violent interpretation activated by "shoots her husband."',
  },
  {
    id: 'rid-014',
    category: 'riddles',
    prompt:
      'What can you hold in your right hand but never in your left?',
    choices: ['Your left hand', 'A pen', 'A phone', 'Air'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Your left hand! You can hold your left hand with your right hand, but not vice versa. A playful self-referential constraint.',
  },
  {
    id: 'rid-015',
    category: 'riddles',
    prompt:
      'I am light as a feather, yet even the strongest person cannot hold me for more than five minutes. What am I?',
    choices: ['Breath', 'A thought', 'A flame', 'A bubble'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Breath: you cannot hold your breath for more than a few minutes regardless of strength. The riddle exploits the literal meaning of "hold."',
  },
  {
    id: 'rid-016',
    category: 'riddles',
    prompt:
      'What loses its head in the morning and gets it back at night?',
    choices: ['A pillow', 'A candle', 'The sun', 'A shadow'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'A pillow: in the morning when you get up the pillowcase is off (you put your head on the pillow at night, placing your "head" back on it). Alternative: a candle loses its flame (head) in daylight and is lit again at night. Both interpretations are valid. Ambiguity is a feature of good riddles.',
  },
  {
    id: 'rid-017',
    category: 'riddles',
    prompt:
      'The more you remove from me the bigger I get. What am I?',
    choices: ['A hole', 'A shadow', 'Silence', 'Debt'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A hole: the more material you remove (by digging), the larger the hole becomes. The paradox of increasing size through subtraction.',
  },
  {
    id: 'rid-018',
    category: 'riddles',
    prompt:
      'I have branches but no fruit, bark but no bite, leaves but no colour in winter. What am I?',
    choices: ['A library', 'A bank', 'A tree', 'A river'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      '"Branches" (departments), "bark" (the counter/facade), "leaves" (pages): this could describe a library (book leaves, branches = library branches) or a bank (bank branches, etc.). The visual imagery of a tree is the misdirection. The intended answer is library: it has no fruit (edible), bark (sound), or coloured leaves in winter (closed pages).',
  },
  {
    id: 'rid-019',
    category: 'riddles',
    prompt:
      'What has 13 hearts but no other organs?',
    choices: ['A deck of cards', 'A hospital', 'A cemetery', 'A choir'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A standard deck of 52 playing cards has 13 Hearts (the suit). "Hearts" as a suit vs. the organ is the misdirection.',
  },
  {
    id: 'rid-020',
    category: 'riddles',
    prompt:
      'A man walks into a restaurant and orders albatross soup. He takes one sip, goes home, and kills himself. Why?',
    choices: [
      'He had been stranded on an island; his companion died; "albatross soup" they made was actually his companion. The real soup confirmed he had eaten human flesh.',
      'He was allergic to albatross',
      'The soup was poisoned',
      'He couldn\'t afford to pay',
    ],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'Classic lateral thinking story puzzle. The man was a sailor stranded on an island. After a disaster, his partner served "albatross soup" to survive. When the man tasted real albatross soup in the restaurant and it tasted different, he realised what he had actually eaten: his deceased companion. The emotional truth leads to suicide. This type of puzzle trains hypothesis generation and narrative reconstruction.',
  },
  {
    id: 'rid-021',
    category: 'riddles',
    prompt:
      'What do you throw out when you want to use it but take in when you don\'t?',
    choices: ['An anchor', 'A boomerang', 'A kite', 'A fishing net'],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'An anchor: you throw it out (overboard) to hold the ship in place when you want to stay, and you pull it back in when you want to move (don\'t need it out anymore).',
  },
  {
    id: 'rid-022',
    category: 'riddles',
    prompt:
      'What question can you never honestly answer "Yes" to?',
    choices: [
      '"Are you asleep?"',
      '"Are you breathing?"',
      '"Are you alive?"',
      '"Do you exist?"',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'If you are asleep you cannot answer. If you can answer, you are awake, so you can never truthfully say "Yes, I am asleep." A classic self-referential paradox.',
  },
  {
    id: 'rid-023',
    category: 'riddles',
    prompt:
      'Forward I am heavy; backward I am not. What am I?',
    choices: ['Ton', 'Weight', 'Lead', 'Stone'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      '"Ton" forward = a unit of heavy weight. Backwards = "not." Wordplay combining reversal with meaning.',
  },
  {
    id: 'rid-024',
    category: 'riddles',
    prompt:
      'Two fathers and two sons go fishing. They each catch exactly one fish. They bring home three fish total. How?',
    choices: [
      'The group is: grandfather, father, and son (three people, each filling two roles)',
      'One fish was too small and thrown back',
      'One fish escaped on the way home',
      'One person caught two fish but lost count',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'Three people: grandfather, father, son. The grandfather is a father (of the middle man). The middle man is also a father (of the son) AND a son (of the grandfather). So "two fathers" and "two sons" overlap in one person. Total people = 3, total fish = 3.',
  },
  {
    id: 'rid-025',
    category: 'riddles',
    prompt:
      'I am not alive but I grow. I don\'t have lungs but I need air. I don\'t have a mouth but water kills me. What am I?',
    choices: ['Fire', 'A plant', 'A battery', 'Fungus'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Fire: it "grows" (spreads), requires oxygen (air), but is extinguished by water. Another example of metaphorical properties: fire is described through the lens of living things.',
  },
  {
    id: 'rid-026',
    category: 'riddles',
    prompt:
      'You see a house with two doors. One door leads to freedom, the other to a hungry lion. Two guards stand before the doors. One always tells the truth, one always lies. You can ask only ONE question to ONE guard. What do you ask?',
    choices: [
      '"If I asked the other guard which door leads to freedom, what would they say?" Then choose the OPPOSITE door.',
      '"Which door leads to freedom?" Believe the answer.',
      '"Are you the truth-teller?" Then ask again.',
      '"Which door would you choose?"',
    ],
    answerIndex: 0,
    difficulty: 'hard',
    explanation:
      'The classic two-guards paradox. Asking either guard what the OTHER guard would say creates a double-negation of the lie, so both guards converge on the WRONG door. Choose the opposite. This requires second-order reasoning: reasoning about another agent\'s reasoning.',
  },
  {
    id: 'rid-027',
    category: 'riddles',
    prompt:
      'A man is found dead in a field. He is surrounded by 53 unopened packages. What happened?',
    choices: [
      'His parachute failed to open (the packages are the emergency chute that also failed)',
      'He was buried alive',
      'He ordered too many deliveries',
      'He was struck by lightning',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'The 53 "packages" are parachute packs. He jumped from a plane and neither his main nor backup chute opened. The word "packages" hides the parachute context, triggering the wrong mental model.',
  },
  {
    id: 'rid-028',
    category: 'riddles',
    prompt:
      'What is so fragile that saying its name breaks it?',
    choices: ['Silence', 'Glass', 'A secret', 'Trust'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Silence: the moment you speak the word "silence" you have broken the silence. A self-referential paradox packaged as a riddle.',
  },
  {
    id: 'rid-029',
    category: 'riddles',
    prompt:
      'I always follow you but I never lead. I copy your every move but disappear when light fades. What am I?',
    choices: ['Your shadow', 'Your reflection', 'Your echo', 'Your conscience'],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'A shadow: it follows you (cast behind or around you by the sun), mimics your shape, and vanishes in darkness. Unlike a reflection, it requires a surface and disappears without light.',
  },
  {
    id: 'rid-030',
    category: 'riddles',
    prompt:
      'A woman lives on the 40th floor of an apartment. Every morning she takes the elevator DOWN to the ground floor to go to work. When she comes home, if it is raining she takes the elevator all the way UP to the 40th floor. But if it is NOT raining, she takes the elevator to the 20th floor and walks the rest of the way. Why?',
    choices: [
      'She is short and can only reach the button for floor 20; on rainy days she uses her umbrella to press floor 40',
      'She exercises by walking when the weather is nice',
      'The elevator is slow above floor 20',
      'Floor 40 is reserved for rainy days only',
    ],
    answerIndex: 0,
    difficulty: 'medium',
    explanation:
      'She is too short to reach the button for floor 40. On rainy days she has an umbrella she can use to press the higher button. A lateral thinking puzzle that requires abandoning the assumption that she presses buttons normally.',
  },
  {
    id: 'rid-031',
    category: 'riddles',
    prompt:
      'What word in the English language is always spelled incorrectly?',
    choices: [
      '"Incorrectly"',
      '"Pneumonia"',
      '"Colonel"',
      'There is no such word',
    ],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'The word "incorrectly" is the only word that is always spelled I-N-C-O-R-R-E-C-T-L-Y. It is spelled "incorrectly," which is correct! The trick is the self-referential loop.',
  },
  {
    id: 'rid-032',
    category: 'riddles',
    prompt:
      'A plane crashes on the US-Canada border. Where do they bury the survivors?',
    choices: [
      'You don\'t bury survivors',
      'In the country where the plane departed',
      'In the US, since most borders favour US jurisdiction',
      'Split evenly across both countries',
    ],
    answerIndex: 0,
    difficulty: 'easy',
    explanation:
      'Survivors are alive. You don\'t bury them. The word "survivors" is overlooked when processing the emotionally loaded word "crash." Classic misdirection through loaded language.',
  },
];

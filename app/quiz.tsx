import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  radius as R,
  spacing,
  sticker,
  fonts,
  Sticker,
  Button,
  Chip,
  Mascot,
  Confetti,
} from '../src/ui';
import { getQuiz, Question, CATEGORY_META } from '../src/games';
import { CATEGORY_EMOJI } from '../src/games/categoryMeta';
import { GameArt } from '../src/components/GameArt';
import {
  getSettings,
  incrementUnlock,
  incrementBlocked,
  recordBlockAttempt,
  addMinutes,
  addXp,
} from '../src/services/storage';
import { unlockForMinutes, setQuizVisible } from '../src/services/screenTimeBlocking';
import { ECONOMY_ENABLED } from '../src/config/featureFlags';
import { QUIZ_REWARD } from '../src/economy/shopItems';

type QuizPhase =
  | 'loading'
  | 'memorize'
  | 'question'
  | 'answer_reveal'
  | 'complete_success'
  | 'complete_fail';

type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ app?: string; demo?: string; mode?: string }>();
  const isDemo = params.demo === '1';
  // A quiz launched from a real Screen Time shield carries mode 'screentime'.
  // A practice run started from Home has no params, so it is not counted as
  // reaching for a blocked app.
  const isRealBlock = params.mode === 'screentime';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [choiceStates, setChoiceStates] = useState<ChoiceState[]>([]);
  // Scoring is kept in refs, not state, so handleNext always reads the current
  // value. correctRef counts right answers; wrongRef flips to true on the first
  // miss, which ends the run.
  const correctRef = useRef(0);
  const wrongRef = useRef(false);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Animations
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.7)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const timerWidth = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Tell the root layout the quiz is on screen, so it won't push another quiz
  // when the app foregrounds while a block is active.
  useEffect(() => {
    setQuizVisible(true);
    return () => setQuizVisible(false);
  }, []);

  // Log that the user reached for a blocked app. Real shields only, so practice
  // runs and the onboarding demo do not inflate the stat.
  useEffect(() => {
    if (isRealBlock && !isDemo) recordBlockAttempt();
  }, [isRealBlock, isDemo]);

  // Loads a fresh, reshuffled quiz and resets all run state. Used on mount and
  // on retry, so replaying after a miss never repeats the same questions.
  const loadQuiz = useCallback(async () => {
    const s = await getSettings();
    const q = getQuiz({ category: s.gameCategory, count: s.questionCount });
    setQuestions(q);
    setCurrentQ(0);
    setAnswered(new Array(q.length).fill(false));
    setChoiceStates([]);
    setShowExplanation(false);
    correctRef.current = 0;
    wrongRef.current = false;
    resultOpacity.setValue(0);
    // Recall questions start in a study phase that hides before the question.
    setPhase(q[0]?.memorize ? 'memorize' : 'question');
  }, [resultOpacity]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const animateCardIn = () => {
    cardSlide.setValue(40);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const startTimer = useCallback(() => {
    timerWidth.setValue(1);
    timerAnim.current = Animated.timing(timerWidth, {
      toValue: 0,
      duration: 20000,
      useNativeDriver: false,
    });
    timerAnim.current.start(({ finished }) => {
      if (finished && phase === 'question') {
        // Time ran out, so count it as a wrong answer.
        handleAnswer(-1);
      }
    });
  }, [phase]);

  useEffect(() => {
    if (questions.length === 0) return;
    if (phase === 'memorize') {
      // Study card slides in; no timer runs until they reveal the question.
      animateCardIn();
    } else if (phase === 'question') {
      const q = questions[currentQ];
      setChoiceStates(new Array(q.choices.length).fill('idle'));
      setShowExplanation(false);
      animateCardIn();
      startTimer();
    }
    return () => {
      timerAnim.current?.stop();
    };
  }, [currentQ, phase, questions.length]);

  const handleAnswer = (idx: number) => {
    if (phase !== 'question') return;
    timerAnim.current?.stop();

    const q = questions[currentQ];
    const isCorrect = idx === q.answerIndex;

    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);

    const newStates: ChoiceState[] = q.choices.map((_, i) => {
      if (i === q.answerIndex) return 'correct';
      if (i === idx && !isCorrect) return 'wrong';
      return 'idle';
    });
    setChoiceStates(newStates);
    setPhase('answer_reveal');
    setShowExplanation(true);

    const updatedAnswered = [...answered];
    updatedAnswered[currentQ] = true;
    setAnswered(updatedAnswered);

    if (isCorrect) {
      correctRef.current += 1;
    } else {
      wrongRef.current = true;
    }
  };

  const handleNext = async () => {
    // A single wrong answer ends the run. You need a perfect score to get in,
    // so there is no reason to finish the remaining questions.
    if (wrongRef.current) {
      setPhase('complete_fail');
      if (!isDemo) await incrementBlocked();
      animateResult();
      return;
    }
    if (currentQ + 1 >= questions.length) {
      // Every question was answered correctly, so unlock access.
      setPhase('complete_success');
      if (!isDemo) {
        await incrementUnlock();
        // The minutes economy ships dark for launch. When enabled, a win also
        // banks minutes + Brain XP for the Minute Market. Dormant until
        // featureFlags.economyEnabled is true, so no rebuild to turn it on.
        if (ECONOMY_ENABLED) {
          await addMinutes(QUIZ_REWARD.minutes);
          await addXp(correctRef.current * QUIZ_REWARD.xpPerCorrect + QUIZ_REWARD.xpWinBonus);
        }
      }
      animateResult();
    } else {
      // Advance. The next question studies first if it has material to memorize.
      const nextQ = questions[currentQ + 1];
      setPhase(nextQ?.memorize ? 'memorize' : 'question');
      setCurrentQ((c) => c + 1);
    }
  };

  // Leaving the study phase hides the material and reveals the question + timer.
  const handleReadyToAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('question');
  };

  const animateResult = () => {
    resultScale.setValue(0.7);
    resultOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(resultScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(resultOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleUnlock = async () => {
    if (isDemo) {
      router.back();
      return;
    }
    // Lift the real iOS Screen Time shield, then confirm so the user knows the
    // window is live before returning to reopen the app they were blocked from.
    await unlockForMinutes(15);
    Alert.alert(
      "You're in! 🎉",
      'Your blocked apps are open for 15 minutes. Go use them, then they lock again.',
      [{ text: 'Got it', onPress: () => router.back() }],
    );
  };

  // Retry pulls a brand-new quiz rather than repeating the one just failed.
  const handleRetry = () => {
    loadQuiz();
  };

  // Loading state
  if (phase === 'loading' || questions.length === 0) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Mascot size={96} expr="thinking" />
        <Text style={styles.loadingText}>Firing up your quiz...</Text>
      </View>
    );
  }

  const q = questions[currentQ];

  // Success screen
  if (phase === 'complete_success') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.teal }]}>
        <Confetti />
        <Animated.View
          style={[
            styles.resultWrap,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
            { opacity: resultOpacity, transform: [{ scale: resultScale }] },
          ]}
        >
          <Mascot size={132} expr="excited" />
          <Text style={[styles.resultTitle, { color: colors.white }]}>You earned it!</Text>
          <Text style={[styles.resultSub, { color: colors.white }]}>
            Perfect score, all {questions.length} correct
          </Text>

          <Sticker bg={colors.paper} radius={R.xl} style={styles.earnWrap} innerStyle={styles.earnCard}>
            <Text style={styles.earnLabel}>SCREEN TIME EARNED</Text>
            <Text style={styles.earnBig}>
              +15
              <Text style={styles.earnUnit}> min</Text>
            </Text>
          </Sticker>

          <View style={styles.resultActions}>
            {isDemo ? (
              <Button variant="purple" lg block label="Back to app" onPress={handleUnlock} />
            ) : (
              <>
                <Button
                  variant="purple"
                  lg
                  block
                  label="Claim 15 minutes ⏱️"
                  onPress={handleUnlock}
                />
                <Button
                  variant="coral"
                  lg
                  block
                  label="Take a break from socials 🧘"
                  onPress={() => router.back()}
                />
              </>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }

  // Fail screen
  if (phase === 'complete_fail') {
    return (
      <View style={styles.screen}>
        <Animated.View
          style={[
            styles.resultWrap,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
            { opacity: resultOpacity, transform: [{ scale: resultScale }] },
          ]}
        >
          <Mascot size={132} expr="sad" />
          <Text style={[styles.resultTitle, { color: colors.ink }]}>So close!</Text>
          <Text style={[styles.resultSub, { color: colors.ink }]}>
            You need every question right to get in.
          </Text>
          <Text style={styles.missNote}>
            Give it another go, or take a break and keep your focus.
          </Text>

          <View style={styles.resultActions}>
            <Button
              variant="coral"
              lg
              block
              label="Take a break from socials 🧘"
              onPress={() => router.back()}
            />
            <Chip bg={colors.white} onPress={handleRetry}>
              <Text style={styles.ghostChipText}>Try again</Text>
            </Chip>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Study screen: show the material to memorize, then hide it on continue so
  // the answer cannot be re-read while choosing.
  if (phase === 'memorize') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Chip onPress={() => router.back()}>
            <Ionicons name="close" size={16} color={colors.ink} />
          </Chip>
          <View style={styles.pips}>
            {questions.map((_, i) => {
              const bg =
                i < currentQ ? colors.teal : i === currentQ ? colors.yellow : 'rgba(43,26,16,0.18)';
              return <View key={i} style={[styles.pip, { backgroundColor: bg }]} />;
            })}
          </View>
          <Chip bg={colors.yellow}>
            <Ionicons name="time" size={15} color={colors.ink} />
            <Text style={styles.rewardText}>+15</Text>
          </Chip>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        >
          <View style={styles.mascotRow}>
            <Mascot size={84} expr="thinking" />
            <Text style={styles.status}>Memorize this</Text>
          </View>

          <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
            <Sticker bg={colors.paper} radius={R.xl} innerStyle={styles.studyCard}>
              <Text style={styles.studyText}>{q.memorize}</Text>
            </Sticker>
          </Animated.View>

          <Text style={styles.studyNote}>
            This hides the moment you continue, so there is no peeking. Look carefully.
          </Text>

          <Button
            variant="coral"
            lg
            block
            label="I'm ready, hide it"
            onPress={handleReadyToAnswer}
          />
        </ScrollView>
      </View>
    );
  }

  // Question and answer-reveal screen
  const mascotExpr = phase === 'question' ? 'thinking' : wrongRef.current ? 'sad' : 'excited';
  const statusText =
    phase === 'question'
      ? `Question ${currentQ + 1} of ${questions.length}`
      : wrongRef.current
      ? 'Oof, not quite'
      : 'Nice one! 🎉';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top bar: close, progress pips, reward */}
      <View style={styles.topBar}>
        <Chip onPress={() => router.back()}>
          <Ionicons name="close" size={16} color={colors.ink} />
        </Chip>
        <View style={styles.pips}>
          {questions.map((_, i) => {
            let bg: string;
            if (i < currentQ) bg = colors.teal;
            else if (i === currentQ) {
              bg = phase === 'answer_reveal' ? (wrongRef.current ? colors.pink : colors.teal) : colors.yellow;
            } else bg = 'rgba(43,26,16,0.18)';
            return <View key={i} style={[styles.pip, { backgroundColor: bg }]} />;
          })}
        </View>
        <Chip bg={colors.yellow}>
          <Ionicons name="time" size={15} color={colors.ink} />
          <Text style={styles.rewardText}>+15</Text>
        </Chip>
      </View>

      {/* Timer bar */}
      <View style={styles.timerTrack}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: timerWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: phase === 'question' ? colors.coral : colors.teal,
            },
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (phase === 'answer_reveal' ? 170 : 24) },
        ]}
      >
        {/* Mascot + status */}
        <View style={styles.mascotRow}>
          <Mascot size={84} expr={mascotExpr} />
          <Text style={styles.status}>{statusText}</Text>
        </View>

        {/* Category illustration + badge */}
        <View style={styles.artRow}>
          <GameArt category={q.category} size={84} />
          <Chip bg={colors.white}>
            <Text style={styles.badgeText}>
              {CATEGORY_EMOJI[q.category]} {CATEGORY_META[q.category].label}
            </Text>
          </Chip>
        </View>

        {/* Question card */}
        <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
          <Sticker bg={colors.paper} radius={R.xl} innerStyle={styles.qCard}>
            <Text style={styles.qText}>{q.prompt}</Text>
          </Sticker>
        </Animated.View>

        {/* Why (appears under the question after answering, so the choices below
            stay reviewable while the screen keeps scrolling). */}
        {showExplanation && q.explanation && (
          <Sticker bg={colors.bg2} radius={R.lg} offset={sticker.shadow.sm} innerStyle={styles.explCard}>
            <Text style={styles.explTitle}>💡 Why</Text>
            <Text style={styles.explText}>{q.explanation}</Text>
          </Sticker>
        )}

        {/* Choices */}
        <Animated.View style={{ opacity: cardOpacity, gap: 11 }}>
          {q.choices.map((choice, i) => {
            const state = choiceStates[i] ?? 'idle';
            const revealed = phase === 'answer_reveal';
            let optBg: string = colors.white;
            let fg: string = colors.ink;
            let keyBg: string = colors.yellow;
            let dim = false;
            if (revealed) {
              if (state === 'correct') {
                optBg = colors.teal;
                fg = colors.white;
                keyBg = colors.white;
              } else if (state === 'wrong') {
                optBg = colors.pink;
                fg = colors.white;
                keyBg = colors.white;
              } else {
                dim = true;
              }
            }
            return (
              <Pressable
                key={i}
                disabled={revealed}
                onPress={() => handleAnswer(i)}
                style={{ opacity: dim ? 0.5 : 1 }}
              >
                <Sticker bg={optBg} radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.opt}>
                  <View style={[styles.optKey, { backgroundColor: keyBg }]}>
                    <Text style={styles.optKeyText}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optText, { color: fg }]}>{choice}</Text>
                </Sticker>
              </Pressable>
            );
          })}
        </Animated.View>

      </ScrollView>

      {/* Pinned bottom bar: an instant correct/wrong badge plus the next action,
          so feedback and advancing never need a scroll. */}
      {phase === 'answer_reveal' && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: wrongRef.current ? colors.pink : colors.teal },
            ]}
          >
            <Ionicons
              name={wrongRef.current ? 'close-circle' : 'checkmark-circle'}
              size={20}
              color={colors.white}
            />
            <Text style={styles.resultBadgeText}>
              {wrongRef.current ? 'Wrong answer' : 'Correct!'}
            </Text>
          </View>
          <Button
            variant="coral"
            lg
            block
            label={wrongRef.current || currentQ + 1 >= questions.length ? 'See result' : 'Next question'}
            onPress={handleNext}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.7,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },

  // Pinned bottom action bar (the Next button overlay)
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: sticker.borderWidth,
    borderTopColor: colors.ink,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: colors.ink,
    marginBottom: 10,
  },
  resultBadgeText: { fontFamily: fonts.heading, fontSize: 15, color: colors.white },
  pips: { flex: 1, flexDirection: 'row', gap: 6 },
  pip: { flex: 1, height: 9, borderRadius: R.pill, borderWidth: 2, borderColor: colors.ink },
  rewardText: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },

  // Timer
  timerTrack: {
    height: 10,
    marginHorizontal: 18,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: 'rgba(43,26,16,0.12)',
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: R.pill },

  // Content
  content: { paddingHorizontal: 18, paddingTop: 12, gap: spacing.lg },
  mascotRow: { alignItems: 'center', gap: 8 },
  status: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink, opacity: 0.7 },

  artRow: { alignItems: 'center', gap: 10 },
  badgeText: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },

  qCard: { padding: 20 },
  qText: { fontFamily: fonts.heading, fontSize: 22, color: colors.ink, lineHeight: 28 },

  // Study (memorize) screen
  studyCard: { paddingVertical: 32, paddingHorizontal: 22, alignItems: 'center', minHeight: 150, justifyContent: 'center' },
  studyText: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 34,
  },
  studyNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },

  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 15 },
  optKey: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optKeyText: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  optText: { fontFamily: fonts.body, fontSize: 16, flex: 1 },

  explCard: { padding: 14, gap: 4 },
  explTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },
  explText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.ink, opacity: 0.8, lineHeight: 21 },

  // Result (success + fail share)
  resultWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  resultTitle: { fontFamily: fonts.heading, fontSize: 36, textAlign: 'center' },
  resultSub: { fontFamily: fonts.body, fontSize: 16, textAlign: 'center', opacity: 0.9 },
  missNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: 260,
  },
  earnWrap: { alignSelf: 'stretch' },
  earnCard: { paddingVertical: 20, paddingHorizontal: 28, alignItems: 'center' },
  earnLabel: { fontFamily: fonts.body, fontSize: 12.5, letterSpacing: 0.5, color: colors.ink, opacity: 0.6 },
  earnBig: { fontFamily: fonts.heading, fontSize: 52, color: colors.coral, marginVertical: 2 },
  earnUnit: { fontSize: 24 },
  resultActions: { width: '100%', gap: 12, alignItems: 'center', marginTop: 4 },
  ghostChipText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});

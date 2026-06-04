import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ChoiceButton } from '../src/components/ChoiceButton';
import { QuizProgress } from '../src/components/ProgressBar';
import { ConfettiOverlay } from '../src/components/ConfettiOverlay';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, radius, shadow } from '../src/theme';
import { getQuiz, Question, CATEGORY_META } from '../src/games';
import { CATEGORY_EMOJI } from '../src/games/categoryMeta';
import { GameArt } from '../src/components/GameArt';
import { getSettings } from '../src/services/storage';
import { unlockApp, denyAccess } from '../src/services/blocking';


type QuizPhase = 'loading' | 'question' | 'answer_reveal' | 'complete_success' | 'complete_fail';

type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

const APP_EMOJIS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', twitter: '🐦', youtube: '▶️',
  reddit: '🤖', snapchat: '👻', facebook: '👍', pinterest: '📌',
  test: '🧪', preview: '👁️', demo: '🎮',
};

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ app?: string; demo?: string }>();
  const targetApp = params.app ?? 'instagram';
  const isDemo = params.demo === '1';

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

  useEffect(() => {
    const load = async () => {
      const s = await getSettings();
      const q = getQuiz({ category: s.gameCategory, count: s.questionCount });
      setQuestions(q);
      setAnswered(new Array(q.length).fill(false));
      correctRef.current = 0;
      wrongRef.current = false;
      setPhase('question');
      animateCardIn();
    };
    load();
  }, []);

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
    if (phase === 'question' && questions.length > 0) {
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
      if (!isDemo) await denyAccess(targetApp);
      animateResult();
      return;
    }
    if (currentQ + 1 >= questions.length) {
      // Every question was answered correctly, so unlock access.
      setPhase('complete_success');
      animateResult();
    } else {
      setPhase('question');
      setCurrentQ((c) => c + 1);
    }
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
    const result = await unlockApp(targetApp);
    if (!result.opened) {
      // The app is not installed or its URL scheme is unavailable, so go back.
      router.back();
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    correctRef.current = 0;
    wrongRef.current = false;
    setAnswered(new Array(questions.length).fill(false));
    setPhase('question');
    resultOpacity.setValue(0);
  };

  // ---- LOADING ----
  if (phase === 'loading' || questions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <Text style={styles.loadingText}>Firing up your quiz...</Text>
      </View>
    );
  }

  const q = questions[currentQ];

  // ---- SUCCESS ----
  if (phase === 'complete_success') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['#0A1F16', '#0D0F1A']}
          style={StyleSheet.absoluteFillObject}
        />
        <ConfettiOverlay visible={true} />
        <Animated.View style={[styles.resultContainer, { opacity: resultOpacity, transform: [{ scale: resultScale }] }]}>
          <View style={styles.resultOrb}>
            <LinearGradient colors={colors.gradient.green} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.resultOrbEmoji}>🔓</Text>
          </View>
          <Text style={styles.resultTitle}>You Earned It! 🎉</Text>
          <Text style={styles.resultSubtitle}>
            Perfect score! All {questions.length} correct.
          </Text>
          <Text style={styles.resultTime}>You've gained 15 more minutes of screen time</Text>

          <View style={styles.resultAppBadge}>
            <LinearGradient
              colors={['rgba(0,217,126,0.15)', 'rgba(0,217,126,0.05)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.resultAppEmoji}>{APP_EMOJIS[targetApp] ?? '📱'}</Text>
            <Text style={styles.resultAppName}>
              {targetApp.charAt(0).toUpperCase() + targetApp.slice(1)}
            </Text>
          </View>

          <View style={styles.resultActions}>
            <PrimaryButton
              label={isDemo ? 'Back to App' : 'Redeem 15 min →'}
              onPress={handleUnlock}
              variant="green"
              size="lg"
            />
            {!isDemo && (
              <PrimaryButton
                label="Stay Off Apps 🧘"
                onPress={() => router.back()}
                variant="ghost"
                size="md"
              />
            )}
          </View>
        </Animated.View>
      </View>
    );
  }

  // ---- FAIL ----
  if (phase === 'complete_fail') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['#1F0A0E', '#0D0F1A']}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View style={[styles.resultContainer, { opacity: resultOpacity, transform: [{ scale: resultScale }] }]}>
          <View style={[styles.resultOrb, styles.resultOrbFail]}>
            <LinearGradient colors={colors.gradient.failBanner} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.resultOrbEmoji}>🚫</Text>
          </View>
          <Text style={[styles.resultTitle, { color: colors.brand.coral }]}>Wrong Answer!</Text>
          <Text style={styles.resultSubtitle}>
            That one's not right, and you need every question correct to get in.
          </Text>
          <Text style={[styles.resultTime, { color: colors.text.secondary }]}>
            Give it another shot, or stay off the app and keep your focus. 🧘
          </Text>

          <View style={styles.resultActions}>
            <PrimaryButton
              label="Try Again 🔄"
              onPress={handleRetry}
              variant="coral"
              size="lg"
            />
            <PrimaryButton
              label="Stay Off Apps"
              onPress={() => router.back()}
              variant="ghost"
              size="md"
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ---- QUESTION / ANSWER_REVEAL ----
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0D0F1A', '#0D1220']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={styles.appLabel}>
            {APP_EMOJIS[targetApp] ?? '📱'} Earn access
          </Text>
          <QuizProgress current={currentQ} total={questions.length} answered={answered} />
        </View>

        <View style={styles.topRight}>
          <Text style={styles.questionCounter}>
            {currentQ + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Timer bar */}
      {phase === 'question' && (
        <View style={styles.timerTrack}>
          <Animated.View
            style={[
              styles.timerFill,
              {
                flex: timerWidth,
              },
            ]}
          >
            <LinearGradient
              colors={colors.gradient.cyan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category illustration */}
        <View style={styles.questionArt}>
          <GameArt category={q.category} size={92} />
        </View>

        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <LinearGradient
            colors={CATEGORY_META[q.category].gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.categoryText}>
            {CATEGORY_EMOJI[q.category]} {CATEGORY_META[q.category].label}
          </Text>
        </View>

        {/* Question card */}
        <Animated.View
          style={[
            styles.questionCard,
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <LinearGradient
            colors={['#1C2035', '#151829']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.questionText}>{q.prompt}</Text>
        </Animated.View>

        {/* Choices */}
        <Animated.View style={{ opacity: cardOpacity }}>
          {q.choices.map((choice, i) => (
            <ChoiceButton
              key={i}
              label={choice}
              index={i}
              state={choiceStates[i] ?? 'idle'}
              onPress={() => handleAnswer(i)}
              disabled={phase === 'answer_reveal'}
            />
          ))}
        </Animated.View>

        {/* Explanation */}
        {showExplanation && q.explanation && (
          <Animated.View style={[styles.explanationCard, { opacity: cardOpacity }]}>
            <LinearGradient
              colors={['rgba(0,245,255,0.06)', 'rgba(0,245,255,0.02)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.explanationTitle}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{q.explanation}</Text>
          </Animated.View>
        )}

        {/* Next / Finish button */}
        {phase === 'answer_reveal' && (
          <Animated.View style={{ opacity: cardOpacity, marginTop: spacing.sm }}>
            <PrimaryButton
              label={wrongRef.current || currentQ + 1 >= questions.length ? 'See Result →' : 'Next Question →'}
              onPress={handleNext}
              variant="cyan"
              size="lg"
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 64, marginBottom: spacing.base },
  loadingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.text.secondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  topCenter: { flex: 1, gap: 6 },
  appLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  topRight: { width: 44, alignItems: 'flex-end' },
  questionCounter: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
    color: colors.brand.cyan,
  },
  timerTrack: {
    height: 3,
    backgroundColor: colors.bg.card,
    flexDirection: 'row',
  },
  timerFill: {
    height: 3,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  questionArt: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  categoryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.3,
  },
  questionCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 120,
    justifyContent: 'center',
    ...shadow.md,
  },
  questionText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: colors.text.primary,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  explanationCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  explanationTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.brand.cyan,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  explanationText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  resultOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadow.lg,
  },
  resultOrbFail: {
    shadowColor: colors.brand.coral,
  },
  resultOrbEmoji: { fontSize: 54 },
  resultTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 42,
    color: colors.brand.green,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  resultTime: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.brand.green,
    marginBottom: spacing.xxl,
  },
  resultAppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,217,126,0.3)',
    marginBottom: spacing.xxl,
  },
  resultAppEmoji: { fontSize: 22 },
  resultAppName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.brand.green,
  },
  resultActions: {
    width: '100%',
    gap: spacing.sm,
  },
});

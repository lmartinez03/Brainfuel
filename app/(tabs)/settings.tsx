import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header } from '../../src/components/Header';
import { GameCard } from '../../src/components/GameCard';
import { colors, spacing, radius, shadow } from '../../src/theme';
import { getSettings, saveSettings } from '../../src/services/storage';
import { GameCategory, QuizCount } from '../../src/games/types';
import { CATEGORY_META } from '../../src/games';
import { CATEGORY_EMOJI, ALL_CATEGORIES } from '../../src/games/categoryMeta';

const QUESTION_COUNTS: QuizCount[] = [1, 3, 5];

const COUNT_LABELS: Record<QuizCount, { label: string; sub: string; time: string }> = {
  1: { label: '1 Question', sub: 'Quick', time: '~30s' },
  3: { label: '3 Questions', sub: 'Balanced', time: '~90s' },
  5: { label: '5 Questions', sub: 'Earn it', time: '~3min' },
};

function CountOption({
  count,
  selected,
  onPress,
}: {
  count: QuizCount;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const meta = COUNT_LABELS[count];

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.sequence([
            Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 12 }),
          ]).start();
          onPress();
        }}
        style={[styles.countBtn, selected && styles.countBtnSelected]}
      >
        {selected && (
          <LinearGradient
            colors={['rgba(0,245,255,0.15)', 'rgba(0,245,255,0.04)']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <Text style={[styles.countNum, selected && styles.countNumSelected]}>{count}</Text>
        <Text style={[styles.countLabel, selected && styles.countLabelSelected]}>{meta.sub}</Text>
        <Text style={styles.countTime}>{meta.time}</Text>
        {selected && <View style={styles.countCheck}><Text style={styles.countCheckText}>✓</Text></View>}
      </Pressable>
    </Animated.View>
  );
}

export default function GameSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [category, setCategory] = useState<GameCategory>('random');
  const [questionCount, setQuestionCount] = useState<QuizCount>(3);

  useFocusEffect(
    useCallback(() => {
      getSettings().then((s) => {
        setCategory(s.gameCategory);
        setQuestionCount(s.questionCount);
      });
    }, [])
  );

  const handleCategoryChange = async (cat: GameCategory) => {
    Haptics.selectionAsync();
    setCategory(cat);
    await saveSettings({ gameCategory: cat });
  };

  const handleCountChange = async (n: QuizCount) => {
    setQuestionCount(n);
    await saveSettings({ questionCount: n });
  };

  const selectedMeta = CATEGORY_META[category];
  const selectedEmoji = CATEGORY_EMOJI[category];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Game Settings" subtitle="Customize your quiz experience" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Count */}
        <Text style={styles.sectionLabel}>Questions to Unlock</Text>
        <Text style={styles.sectionSub}>How many questions must you answer to gain 15 minutes?</Text>
        <View style={styles.countRow}>
          {QUESTION_COUNTS.map((n) => (
            <CountOption
              key={n}
              count={n}
              selected={questionCount === n}
              onPress={() => handleCountChange(n)}
            />
          ))}
        </View>

        {/* Category */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Game Category</Text>
        <Text style={styles.sectionSub}>Which type of brain challenge do you want?</Text>

        <View style={styles.cardsGrid}>
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const emoji = CATEGORY_EMOJI[cat];
            return (
              <GameCard
                key={cat}
                title={meta.label}
                emoji={emoji}
                category={cat}
                description={meta.description}
                gradient={meta.gradient}
                selected={category === cat}
                onPress={() => handleCategoryChange(cat)}
              />
            );
          })}
        </View>

        {/* Preview CTA */}
        <Pressable
          onPress={() => router.push({ pathname: '/quiz', params: { app: 'preview', demo: '1' } })}
          style={styles.previewBtn}
        >
          <LinearGradient
            colors={['#1C2035', '#151829']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>Preview Current Settings</Text>
            <Text style={styles.previewSub}>
              {questionCount} {selectedEmoji} {selectedMeta.label} question{questionCount > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.previewArrow}>
            <LinearGradient colors={colors.gradient.orange} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="play" size={14} color="#fff" />
          </View>
        </Pressable>

        {/* Shortcuts Link */}
        <Pressable onPress={() => router.push('/shortcuts')} style={styles.shortcutsLink}>
          <Ionicons name="link" size={16} color={colors.brand.cyan} />
          <Text style={styles.shortcutsLinkText}>Set up iOS Shortcuts automation →</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.base,
    lineHeight: 19,
  },
  countRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countBtn: {
    borderRadius: radius.xl,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.card,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
  },
  countBtnSelected: {
    borderColor: colors.brand.cyan,
    ...shadow.cyan,
  },
  countNum: {
    fontFamily: 'Nunito_900Black',
    fontSize: 32,
    color: colors.text.secondary,
    lineHeight: 38,
  },
  countNumSelected: { color: colors.brand.cyan },
  countLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  countLabelSelected: { color: colors.brand.cyanDim },
  countTime: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  countCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCheckText: {
    fontSize: 11,
    color: colors.text.inverse,
    fontWeight: '900',
  },
  cardsGrid: { gap: spacing.sm },
  previewBtn: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  previewLeft: { flex: 1 },
  previewTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text.primary,
  },
  previewSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  previewArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingVertical: spacing.base,
  },
  shortcutsLinkText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.brand.cyan,
  },
});

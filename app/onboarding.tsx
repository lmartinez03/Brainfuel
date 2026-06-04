import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, radius } from '../src/theme';

const { width: SW } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧠',
    title: 'Meet Brainfuel',
    subtitle: 'Your brain\'s personal trainer',
    body: 'Stop mindlessly doom-scrolling. Every time you reach for a distracting app, Brainfuel challenges you to earn it.',
    accent: colors.brand.cyan,
    gradient: ['#0D0F1A', '#0D1F2D'] as const,
  },
  {
    emoji: '⚡',
    title: 'Earn Your Access',
    subtitle: 'Quiz to unlock',
    body: 'Answer 1, 3, or 5 brain-game questions. Nail them and you get 15 minutes of access. Fail and you\'re locked out. Your call.',
    accent: colors.brand.orange,
    gradient: ['#0D0F1A', '#1F120A'] as const,
  },
  {
    emoji: '🎮',
    title: 'Stay Sharp',
    subtitle: 'Memory · Math · Puzzles · Riddles',
    body: 'Four categories of mind-bending challenges. Each quiz is randomized so you never coast on muscle memory.',
    accent: colors.brand.purple,
    gradient: ['#0D0F1A', '#170D2A'] as const,
  },
  {
    emoji: '🔗',
    title: 'Powered by Shortcuts',
    subtitle: 'iOS automation magic',
    body: 'Set up a 1-minute iOS Shortcut automation. When you open Instagram, Brainfuel intercepts (just like one sec). We\'ll show you how.',
    accent: colors.brand.green,
    gradient: ['#0D0F1A', '#0A1F16'] as const,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
    if (idx !== currentIdx) {
      setCurrentIdx(idx);
      Haptics.selectionAsync();
    }
  };

  const goNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: SW * (currentIdx + 1), animated: true });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('brainfuel_onboarded', 'true');
    router.replace('/(tabs)');
  };

  const slide = SLIDES[currentIdx];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={slide.gradient}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip */}
      {currentIdx < SLIDES.length - 1 && (
        <Pressable
          onPress={handleComplete}
          style={[styles.skipBtn, { top: insets.top + 16 }]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width: SW }]}>
            {/* Floating emoji orb */}
            <View style={[styles.emojiOrb, { borderColor: `${s.accent}40`, shadowColor: s.accent }]}>
              <LinearGradient
                colors={[`${s.accent}22`, `${s.accent}06`]}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.slideEmoji}>{s.emoji}</Text>
            </View>

            <Text style={[styles.slideSubtitle, { color: s.accent }]}>{s.subtitle}</Text>
            <Text style={styles.slideTitle}>{s.title}</Text>
            <Text style={styles.slideBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === currentIdx && [styles.dotActive, { backgroundColor: slide.accent }],
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <PrimaryButton
          label={currentIdx === SLIDES.length - 1 ? 'Get Started 🚀' : 'Next →'}
          onPress={goNext}
          variant={currentIdx === SLIDES.length - 1 ? 'green' : 'cyan'}
          size="lg"
        />
        {currentIdx === SLIDES.length - 1 && (
          <Text style={styles.trialNote}>3-day free trial · Cancel anytime</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  skipBtn: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  skipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
  },
  emojiOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  slideEmoji: {
    fontSize: 64,
  },
  slideSubtitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  slideTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 36,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: spacing.base,
  },
  slideBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.medium,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  cta: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  trialNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

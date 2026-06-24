import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  colors,
  radius,
  spacing,
  sticker,
  fonts,
  Sticker,
  Button,
  Chip,
  Mascot,
} from '../src/ui';
import type { Expr } from '../src/ui';

const { width: SW } = Dimensions.get('window');

type Slide = {
  mascotExpr: Expr;
  chipLabel: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    mascotExpr: 'happy',
    chipLabel: 'Welcome',
    title: 'Meet Brainfuel',
    body: 'Stop mindlessly scrolling. Every time you reach for a distracting app, Brainfuel challenges you to earn it first.',
  },
  {
    mascotExpr: 'excited',
    chipLabel: 'Quiz to unlock',
    title: 'Earn Your Access',
    body: 'Answer 3, 5, or 10 brain-game questions. Nail them and you get 15 minutes of access. Fail and you stay locked out. Your call.',
  },
  {
    mascotExpr: 'thinking',
    chipLabel: 'Memory, Math, Puzzles, Riddles',
    title: 'Stay Sharp',
    body: 'Six categories of mind-bending challenges. Each quiz is randomized so you never coast on muscle memory.',
  },
  {
    mascotExpr: 'wow',
    chipLabel: 'Powered by Apple Screen Time',
    title: 'Real App Blocking',
    body: 'Brainfuel uses Apple Screen Time to truly block your chosen apps. Open one and a shield appears. Pass a quick brain quiz to unlock 15 minutes.',
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
    // A subscription is mandatory, so onboarding leads into the paywall. The
    // entry screen sends already-subscribed users straight to the tabs.
    router.replace('/paywall');
  };

  const isLast = currentIdx === SLIDES.length - 1;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />

      {/* Skip button */}
      {!isLast && (
        <Pressable
          onPress={handleComplete}
          style={[styles.skipBtn, { top: insets.top + 14 }]}
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
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 56 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width: SW }]}>
            {/* Mascot */}
            <Mascot size={130} expr={s.mascotExpr} style={styles.mascot} />

            {/* Chip subtitle */}
            <Chip bg={colors.yellow} style={styles.chip}>
              <Text style={styles.chipText}>{s.chipLabel}</Text>
            </Chip>

            {/* Heading */}
            <Text style={styles.title}>{s.title}</Text>

            {/* Body in a paper sticker card */}
            <Sticker
              bg={colors.paper}
              radius={radius.xl}
              offset={sticker.shadow.md}
              style={styles.bodyCard}
              innerStyle={styles.bodyCardInner}
            >
              <Text style={styles.body}>{s.body}</Text>
            </Sticker>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIdx ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.cta, { paddingHorizontal: 20 }]}>
        <Button
          variant="coral"
          lg
          block
          label={isLast ? 'Get started' : 'Next'}
          onPress={goNext}
        />
        {isLast && (
          <Text style={styles.trialNote}>3 day free trial, cancel anytime</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Skip
  skipBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: 2.5,
    borderColor: colors.ink,
    // hard offset shadow
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },

  // Slide
  slide: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: spacing.md,
  },
  mascot: {
    marginBottom: 4,
  },

  // Chip
  chip: {
    alignSelf: 'center',
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },

  // Heading
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 42,
  },

  // Body card
  bodyCard: {
    width: '100%',
    marginTop: 4,
  },
  bodyCardInner: {
    padding: 20,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.85,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  dot: {
    height: 9,
    borderRadius: radius.pill,
  },
  dotActive: {
    width: 26,
    backgroundColor: colors.ink,
  },
  dotInactive: {
    width: 9,
    backgroundColor: colors.ink,
    opacity: 0.22,
  },

  // CTA
  cta: {
    gap: 10,
    paddingBottom: 18,
  },
  trialNote: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    textAlign: 'center',
  },
});

import React, { useRef, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

interface ChoiceButtonProps {
  label: string;
  index: number;
  state: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const STATE_COLORS: Record<ChoiceState, { border: string; bg: string; text: string; badge: string; badgeBg: string }> = {
  idle: {
    border: colors.border.medium,
    bg: colors.bg.card,
    text: colors.text.primary,
    badge: colors.text.secondary,
    badgeBg: colors.bg.cardAlt,
  },
  selected: {
    border: colors.brand.cyan,
    bg: 'rgba(0, 245, 255, 0.08)',
    text: colors.brand.cyan,
    badge: colors.text.inverse,
    badgeBg: colors.brand.cyan,
  },
  correct: {
    border: colors.brand.green,
    bg: 'rgba(0, 217, 126, 0.12)',
    text: colors.brand.green,
    badge: colors.text.inverse,
    badgeBg: colors.brand.green,
  },
  wrong: {
    border: colors.brand.coral,
    bg: 'rgba(255, 77, 109, 0.1)',
    text: colors.brand.coral,
    badge: colors.text.inverse,
    badgeBg: colors.brand.coral,
  },
};

export function ChoiceButton({ label, index, state, onPress, disabled }: ChoiceButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'wrong') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    if (state === 'correct') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.04,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
      ]).start();
    }
  }, [state]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 15,
    }).start();
  };

  const s = STATE_COLORS[state];

  return (
    <Animated.View
      style={{
        transform: [
          { scale: Animated.multiply(scale, bounceAnim) },
          { translateX: shakeAnim },
        ],
      }}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            borderColor: s.border,
            backgroundColor: s.bg,
          },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: s.badgeBg }]}>
          <Text style={[styles.badgeText, { color: s.badge }]}>{LETTERS[index]}</Text>
        </View>
        <Text style={[styles.label, { color: s.text }]} numberOfLines={3}>
          {label}
        </Text>
        {state === 'correct' && (
          <Text style={styles.stateIcon}>✓</Text>
        )}
        {state === 'wrong' && (
          <Text style={styles.stateIcon}>✗</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
  },
  label: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
  },
  stateIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.brand.green,
  },
});

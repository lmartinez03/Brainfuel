import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  height?: number;
  variant?: 'cyan' | 'orange' | 'green' | 'yellow';
}

const GRADIENTS = {
  cyan: colors.gradient.cyan,
  orange: colors.gradient.orange,
  green: colors.gradient.green,
  yellow: colors.gradient.yellow,
};

export function ProgressBar({
  current,
  total,
  showLabel = false,
  height = 10,
  variant = 'cyan',
}: ProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const progressPercent = total > 0 ? current / total : 0;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: progressPercent,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [progressPercent]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={styles.label}>
          {current} / {total}
        </Text>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]}>
          <LinearGradient
            colors={GRADIENTS[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Shine */}
          <View style={styles.shine} />
        </Animated.View>
      </View>
    </View>
  );
}

// Segmented variant showing question dots
interface QuizProgressProps {
  current: number;  // 0-indexed current question
  total: number;
  answered: boolean[];
}

export function QuizProgress({ current, total, answered }: QuizProgressProps) {
  return (
    <View style={segStyles.container}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current || answered[i];
        return (
          <View
            key={i}
            style={[
              segStyles.dot,
              isDone && segStyles.dotDone,
              isActive && segStyles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  track: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
});

const segStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.card,
    maxWidth: 60,
  },
  dotDone: {
    backgroundColor: colors.brand.cyan,
  },
  dotActive: {
    backgroundColor: colors.brand.cyanDim,
    transform: [{ scaleY: 1.4 }],
  },
});

import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadow } from '../theme';
import { GameArt, GameArtCategory } from './GameArt';

interface GameCardProps {
  title: string;
  emoji: string;
  description: string;
  gradient: readonly [string, string];
  onPress?: () => void;
  selected?: boolean;
  questionCount?: number;
  /** When set, shows the category's vector illustration instead of the emoji. */
  category?: GameArtCategory;
}

export function GameCard({
  title,
  emoji,
  description,
  gradient,
  onPress,
  selected = false,
  questionCount,
  category,
}: GameCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 280,
      friction: 15,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, selected && styles.selectedBorder]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Dot pattern overlay */}
        <View style={styles.patternOverlay} pointerEvents="none" />

        {category ? (
          <View style={styles.artWell}>
            <GameArt category={category} size={48} />
          </View>
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {questionCount !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{questionCount} Q's</Text>
          </View>
        )}
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    minHeight: 120,
    overflow: 'hidden',
    ...shadow.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedBorder: {
    borderColor: colors.brand.cyan,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  emoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  artWell: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  checkmark: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: '#0D0F1A',
    fontWeight: '900',
  },
});

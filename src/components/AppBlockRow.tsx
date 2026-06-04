import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme';

interface AppBlockRowProps {
  appName: string;
  emoji: string;
  category: string;
  blocked: boolean;
  onToggle: (blocked: boolean) => void;
  /** When provided, shows a remove button (used for user-added custom apps). */
  onRemove?: () => void;
}

export function AppBlockRow({ appName, emoji, category, blocked, onToggle, onRemove }: AppBlockRowProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(val);
    if (val) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.03, useNativeDriver: true, tension: 300, friction: 10 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 12 }),
      ]).start();
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, blocked && styles.blocked]}>
      <View style={[styles.iconWrap, blocked && styles.iconWrapBlocked]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, blocked && styles.nameBlocked]}>{appName}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
      {blocked && (
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldText}>🛡️</Text>
        </View>
      )}
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.text.tertiary} />
        </Pressable>
      )}
      <Switch
        value={blocked}
        onValueChange={handleToggle}
        trackColor={{ false: colors.bg.cardAlt, true: colors.brand.cyanDim }}
        thumbColor={blocked ? colors.brand.cyan : colors.text.tertiary}
        ios_backgroundColor={colors.bg.cardAlt}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    gap: spacing.md,
  },
  blocked: {
    borderColor: colors.border.accent,
    backgroundColor: 'rgba(0,245,255,0.04)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapBlocked: {
    backgroundColor: 'rgba(0,245,255,0.12)',
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.text.primary,
  },
  nameBlocked: {
    color: colors.brand.cyan,
  },
  category: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  shieldBadge: {
    marginRight: -4,
  },
  shieldText: {
    fontSize: 16,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bg.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

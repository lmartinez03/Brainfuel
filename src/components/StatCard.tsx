import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadow } from '../theme';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  gradient?: readonly [string, string];
  accent?: string;
}

export function StatCard({ value, label, icon, gradient, accent = colors.brand.cyan }: StatCardProps) {
  return (
    <View style={[styles.container, shadow.md]}>
      <LinearGradient
        colors={gradient ?? [colors.bg.card, colors.bg.cardAlt]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 100,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 26,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

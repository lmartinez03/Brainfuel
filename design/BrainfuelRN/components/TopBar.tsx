// components/TopBar.tsx
// Brand + streak + shop (minutes balance) row at the top of the main tabs.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mascot from './Mascot';
import Chip from './Chip';
import { colors, fonts } from '../theme';

type Props = {
  brand: string;
  minutes: number;
  streak: number;
  onShop: () => void;
  onStreak: () => void;
};

export default function TopBar({ brand, minutes, streak, onShop, onStreak }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Mascot size={30} />
        <Text style={styles.brandText}>{brand}</Text>
      </View>
      <View style={styles.actions}>
        <Chip bg={colors.white} onPress={onStreak}>
          <Ionicons name="flame" size={16} color={colors.coral} />
          <Text style={styles.chipText}>{streak}</Text>
        </Chip>
        <Chip bg={colors.yellow} onPress={onShop}>
          <Ionicons name="cart" size={16} color={colors.ink} />
          <Text style={styles.chipText}>{minutes}m</Text>
        </Chip>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 20, fontWeight: fonts.weight.heading, color: colors.ink },
  actions: { flexDirection: 'row', gap: 8 },
  chipText: { fontWeight: fonts.weight.headingHeavy, fontSize: 14, color: colors.ink },
});

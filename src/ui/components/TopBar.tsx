// components/TopBar.tsx
// Brand row at the top of the main tabs, with the shop minutes balance when the
// economy is enabled.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mascot from './Mascot';
import Chip from './Chip';
import { colors, fonts } from '../theme';
import { ECONOMY_ENABLED } from '../../config/featureFlags';

type Props = {
  brand: string;
  /** Banked minutes balance. Only shown when the economy is enabled. */
  minutes?: number;
  /** Opens the shop. Only shown when the economy is enabled. */
  onShop?: () => void;
};

export default function TopBar({ brand, minutes = 0, onShop }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <Mascot size={30} />
        <Text style={styles.brandText}>{brand}</Text>
      </View>
      {ECONOMY_ENABLED && (
        <View style={styles.actions}>
          <Chip bg={colors.yellow} onPress={onShop}>
            <Ionicons name="cart" size={16} color={colors.ink} />
            <Text style={styles.chipText}>{minutes}m</Text>
          </Chip>
        </View>
      )}
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
  brandText: { fontSize: 20, fontFamily: fonts.heading, color: colors.ink },
  actions: { flexDirection: 'row', gap: 8 },
  chipText: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
});

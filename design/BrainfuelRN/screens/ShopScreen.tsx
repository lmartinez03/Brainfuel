// screens/ShopScreen.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import Sticker from '../components/Sticker';
import Chip from '../components/Chip';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { SHOP_ITEMS, ShopItem, AppState } from '../data';

type Props = {
  state: AppState;
  onBack: () => void;
  onBuy: (item: ShopItem) => void;
};

export default function ShopScreen({ state, onBack, onBuy }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Chip bg={colors.white} onPress={onBack}>
          <Ionicons name="chevron-back" size={16} color={colors.ink} />
          <Text style={styles.chipText}>Back</Text>
        </Chip>
        <Chip bg={colors.yellow}>
          <Ionicons name="cart" size={16} color={colors.ink} />
          <Text style={styles.chipText}>{state.minutes} min</Text>
        </Chip>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Mascot size={76} expr="wow" />
          <Text style={styles.title}>Minute Market</Text>
          <Text style={styles.sub}>Spend your hard-earned minutes 🪙</Text>
        </View>

        <View style={styles.grid}>
          {SHOP_ITEMS.map((item) => {
            const isOwned = !!state.owned[item.id] && !item.repeat;
            const cant = !isOwned && state.minutes < item.price;
            return (
              <Sticker
                key={item.id}
                radius={R.lg}
                offset={sticker.shadow.sm}
                style={{ width: '47.5%' }}
                innerStyle={styles.item}
              >
                <View style={[styles.icon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                </View>
                <Text style={styles.nm}>{item.nm}</Text>
                <Text style={styles.ds}>{item.ds}</Text>
                <Pressable
                  disabled={isOwned || cant}
                  onPress={() => onBuy(item)}
                  style={[
                    styles.price,
                    isOwned && { backgroundColor: colors.teal },
                    cant && { backgroundColor: '#efe7dc' },
                  ]}
                >
                  <Text
                    style={[
                      styles.priceText,
                      isOwned && { color: colors.white },
                      cant && { color: colors.muted },
                    ]}
                  >
                    {isOwned ? 'Owned ✓' : item.price === 0 ? 'Free!' : `${item.price} min`}
                  </Text>
                </Pressable>
              </Sticker>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chipText: { fontWeight: fonts.weight.headingHeavy, fontSize: 14, color: colors.ink },
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: spacing.lg },
  title: { fontWeight: fonts.weight.heading, fontSize: 30, color: colors.ink },
  sub: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, color: colors.ink, opacity: 0.6, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  item: { padding: 14, gap: 8 },
  icon: { width: 52, height: 52, borderRadius: 15, borderWidth: 2.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  nm: { fontWeight: fonts.weight.heading, fontSize: 16, color: colors.ink },
  ds: { fontWeight: fonts.weight.body, fontSize: 12, color: colors.ink, opacity: 0.65, lineHeight: 16, minHeight: 32 },
  price: {
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: R.pill,
    backgroundColor: colors.yellow,
    paddingVertical: 6,
    paddingHorizontal: 11,
    alignItems: 'center',
  },
  priceText: { fontWeight: fonts.weight.heading, fontSize: 15, color: colors.ink },
});

// components/TabBar.tsx
// Bottom navigation with a raised, fully-opaque center "Play" button.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sticker, fonts } from '../theme';

export type TabId = 'home' | 'blocked' | 'stats' | 'you';

type Props = {
  active: TabId;
  onTab: (t: TabId) => void;
  onPlay: () => void;
  bottomInset: number;
};

const TABS: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'blocked', label: 'Blocked', icon: 'ban' },
  { id: 'stats', label: 'Stats', icon: 'stats-chart' },
  { id: 'you', label: 'You', icon: 'person' },
];

export default function TabBar({ active, onTab, onPlay, bottomInset }: Props) {
  // home, blocked, [play], stats, you
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View style={[styles.bar, { paddingBottom: 12 + bottomInset }]}>
      {left.map((t) => (
        <TabButton key={t.id} {...t} active={active === t.id} onPress={() => onTab(t.id)} />
      ))}

      {/* Center FAB sits outside any dimmed tab so it stays 100% opaque. */}
      <View style={styles.fabSlot}>
        <Pressable onPress={onPlay} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Ionicons name="play" size={26} color={colors.white} style={{ marginLeft: 3 }} />
        </Pressable>
      </View>

      {right.map((t) => (
        <TabButton key={t.id} {...t} active={active === t.id} onPress={() => onTab(t.id)} />
      ))}
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, { opacity: active ? 1 : 0.45 }]}>
      <Ionicons name={icon} size={24} color={colors.ink} />
      <Text style={styles.tabLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.paper,
    borderTopWidth: sticker.borderWidth,
    borderTopColor: colors.ink,
    paddingHorizontal: 12,
    paddingTop: 11,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, fontFamily: fonts.headingBold, color: colors.ink },
  fabSlot: { width: 70, alignItems: 'center' },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -30,
    backgroundColor: colors.pink,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    // hard offset shadow (Android elevation as a fallback)
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  fabPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
});

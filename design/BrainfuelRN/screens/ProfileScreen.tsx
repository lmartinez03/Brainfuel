// screens/ProfileScreen.tsx  (the "You" tab)
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import Sticker from '../components/Sticker';
import Chip from '../components/Chip';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { BADGES, AppState } from '../data';

const SETTINGS = [
  { nm: 'Block schedule', sub: 'Weekdays 9am – 6pm' },
  { nm: 'Daily free time', sub: '60 minutes' },
  { nm: 'Notifications', sub: 'Reminders & nudges on' },
  { nm: 'Difficulty', sub: 'Medium · 3 questions' },
];

export default function ProfileScreen({ state }: { state: AppState }) {
  const insets = useSafeAreaInsets();
  const level = Math.floor(state.xp / 100) + 1;
  const earned = BADGES.filter((b) => b.on).length;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Mascot size={120} expr="happy" />
          <Text style={styles.name}>Maya</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip bg={colors.purple}>
              <Text style={[styles.chipText, { color: colors.white }]}>Brain Lv {level}</Text>
            </Chip>
            <Chip bg={colors.white}>
              <Ionicons name="flame" size={15} color={colors.coral} />
              <Text style={styles.chipText}>{state.streak} days</Text>
            </Chip>
          </View>
        </View>

        <View style={styles.secRow}>
          <Text style={styles.secT}>Badges</Text>
          <Text style={styles.secMore}>
            {earned} of {BADGES.length}
          </Text>
        </View>
        <View style={styles.badgeGrid}>
          {BADGES.map((b, i) => (
            <Sticker key={i} radius={R.md} offset={sticker.shadow.sm} style={{ width: '31%' }} innerStyle={[styles.badge, !b.on && { opacity: 0.45 }]}>
              <View style={[styles.badgeEm, { backgroundColor: b.on ? colors.yellow : '#e7ddd0' }]}>
                <Text style={{ fontSize: 24 }}>{b.on ? b.em : '🔒'}</Text>
              </View>
              <Text style={styles.badgeNm}>{b.nm}</Text>
            </Sticker>
          ))}
        </View>

        <Text style={styles.secT}>Settings</Text>
        <View style={{ gap: 10 }}>
          {SETTINGS.map((r, i) => (
            <Sticker key={i} radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNm}>{r.nm}</Text>
                <Text style={styles.itemSub}>{r.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.ink} />
            </Sticker>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 130, gap: spacing.lg },
  name: { fontWeight: fonts.weight.heading, fontSize: 28, color: colors.ink },
  chipText: { fontWeight: fonts.weight.headingHeavy, fontSize: 14, color: colors.ink },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -4 },
  secT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink },
  secMore: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.55 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  badge: { paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 6 },
  badgeEm: { width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  badgeNm: { fontWeight: fonts.weight.headingHeavy, fontSize: 11, color: colors.ink, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  itemNm: { fontWeight: fonts.weight.heading, fontSize: 16, color: colors.ink },
  itemSub: { fontWeight: fonts.weight.body, fontSize: 12, color: colors.ink, opacity: 0.6, marginTop: 2 },
});

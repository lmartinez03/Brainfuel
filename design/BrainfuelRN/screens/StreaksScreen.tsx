// screens/StreaksScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Sticker from '../components/Sticker';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { AppState } from '../data';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HITS = [true, true, true, true, true, true, false];

export default function StreaksScreen({ state, onClose }: { state: AppState; onClose: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      >
        <View style={{ alignItems: 'flex-end' }}>
          <Chip bg="rgba(255,255,255,0.2)" onPress={onClose}>
            <Ionicons name="close" size={18} color={colors.white} />
          </Chip>
        </View>

        <View style={{ alignItems: 'center', gap: 4 }}>
          <Ionicons name="flame" size={92} color={colors.yellow} />
          <Text style={styles.bigNum}>{state.streak}</Text>
          <Text style={styles.bigLabel}>day streak!</Text>
          <Text style={styles.note}>Play at least one quiz a day to keep the flame alive 🔥</Text>
        </View>

        <Sticker radius={R.xl} innerStyle={{ padding: 16 }}>
          <View style={styles.week}>
            {DAYS.map((d, i) => (
              <View
                key={i}
                style={[
                  styles.day,
                  HITS[i] && { backgroundColor: colors.coral },
                  i === 6 && styles.today,
                ]}
              >
                <Text style={[styles.dayGlyph, HITS[i] && { color: colors.white }]}>
                  {HITS[i] ? '🔥' : i === 6 ? '·' : '✕'}
                </Text>
                <Text style={[styles.dayLbl, HITS[i] && { color: colors.white }]}>{d[0]}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Sticker bg={colors.yellow} radius={R.lg} offset={sticker.shadow.sm} style={{ flex: 1 }} innerStyle={{ padding: 14 }}>
              <Text style={styles.tileV}>12</Text>
              <Text style={styles.tileK}>Longest streak</Text>
            </Sticker>
            <Sticker bg={colors.blue} radius={R.lg} offset={sticker.shadow.sm} style={{ flex: 1 }} innerStyle={{ padding: 14 }}>
              <Text style={[styles.tileV, { color: colors.white }]}>2 🧊</Text>
              <Text style={[styles.tileK, { color: colors.white, opacity: 0.9 }]}>Freezes left</Text>
            </Sticker>
          </View>
        </Sticker>

        <Button variant="yellow" lg block label="Keep it going 🔥" onPress={onClose} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.coral },
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: spacing.lg },
  bigNum: { fontWeight: fonts.weight.heading, fontSize: 72, color: colors.white },
  bigLabel: { fontWeight: fonts.weight.heading, fontSize: 22, color: colors.white },
  note: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, color: colors.white, opacity: 0.92, textAlign: 'center', maxWidth: 260, marginTop: 4 },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    gap: 2,
  },
  today: { borderColor: colors.yellow, borderWidth: 3 },
  dayGlyph: { fontWeight: fonts.weight.headingHeavy, fontSize: 13, color: colors.ink },
  dayLbl: { fontSize: 9, fontWeight: fonts.weight.bodyHeavy, color: colors.ink, opacity: 0.8 },
  tileV: { fontWeight: fonts.weight.heading, fontSize: 26, color: colors.ink },
  tileK: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.7, marginTop: 5 },
});

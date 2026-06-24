// screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mascot from '../components/Mascot';
import Bubble from '../components/Bubble';
import Sticker from '../components/Sticker';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import TopBar from '../components/TopBar';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { APPS, AppState } from '../data';

const TIPS = [
  "LET'S GET THAT BRAIN GAINS 💪",
  "Quiz me and I'll hand over the minutes!",
  "You're on a 7-day roll — don't stop now! 🔥",
  'Bored? Good. Feed me a quiz instead 🧠',
];

type Props = {
  state: AppState;
  brand: string;
  onPlay: () => void;
  onShop: () => void;
  onStreak: () => void;
  onOpenApp: (id: string) => void;
  onSeeBlocked: () => void;
};

export default function HomeScreen({
  state,
  brand,
  onPlay,
  onShop,
  onStreak,
  onOpenApp,
  onSeeBlocked,
}: Props) {
  const insets = useSafeAreaInsets();
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTip((p) => (p + 1) % TIPS.length), 4200);
    return () => clearInterval(t);
  }, []);

  const blockedApps = APPS.filter((a) => state.blocked[a.id]);
  const goal = 60;
  const pct = Math.min(100, Math.round((state.minutes / goal) * 100));

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <TopBar
          brand={brand}
          minutes={state.minutes}
          streak={state.streak}
          onShop={onShop}
          onStreak={onStreak}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* mascot + bubble */}
        <View style={styles.mascotRow}>
          <Mascot size={92} expr="happy" />
          <Bubble text={TIPS[tip]} style={{ flex: 1 }} />
        </View>

        {/* hero */}
        <Sticker bg={colors.coral} radius={R.xl} innerStyle={styles.hero}>
          <Text style={styles.heroLabel}>SCREEN TIME LEFT TODAY</Text>
          <Text style={styles.heroBig}>
            {state.minutes}
            <Text style={styles.heroBigUnit}> min</Text>
          </Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.heroNote}>Win a quiz to bank more — it's the only way ⏳</Text>
        </Sticker>

        {/* stats */}
        <View style={styles.statRow}>
          <Sticker bg={colors.yellow} radius={R.lg} offset={sticker.shadow.sm} style={{ flex: 1 }} innerStyle={styles.stat}>
            <Text style={styles.statV}>
              {Math.floor(state.saved / 60)}h {state.saved % 60}m
            </Text>
            <Text style={styles.statK}>Saved today</Text>
          </Sticker>
          <Sticker bg={colors.teal} radius={R.lg} offset={sticker.shadow.sm} style={{ flex: 1 }} innerStyle={styles.stat}>
            <Text style={[styles.statV, { color: colors.white }]}>{state.xp}</Text>
            <Text style={[styles.statK, { color: colors.white, opacity: 0.9 }]}>Brain XP</Text>
          </Sticker>
        </View>

        {/* locked apps */}
        <View style={styles.secRow}>
          <Text style={styles.secT}>Locked apps</Text>
          <Pressable onPress={onSeeBlocked}>
            <Text style={styles.secMore}>{blockedApps.length} blocked ›</Text>
          </Pressable>
        </View>
        <View style={styles.appsRow}>
          {blockedApps.slice(0, 4).map((a) => (
            <Pressable key={a.id} style={{ flex: 1 }} onPress={() => onOpenApp(a.id)}>
              <Sticker radius={R.lg} offset={sticker.shadow.sm} innerStyle={styles.appTile}>
                <AppIcon grad={a.grad} />
                <Text style={styles.appNm}>{a.nm}</Text>
                <View style={styles.lockBadge}>
                  <Text style={styles.lockGlyph}>🔒</Text>
                </View>
              </Sticker>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>Tap a locked app to see what happens 👀</Text>

        {/* play CTA */}
        <Button variant="coral" lg block label="Play to unlock +15 min" onPress={onPlay}>
          <Mascot size={26} sprout={false} />
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 130, gap: spacing.lg },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4 },
  hero: { padding: 18 },
  heroLabel: { color: colors.white, fontWeight: fonts.weight.headingHeavy, fontSize: 12.5, letterSpacing: 0.5, opacity: 0.92 },
  heroBig: { color: colors.white, fontWeight: fonts.weight.heading, fontSize: 54, marginTop: 4 },
  heroBigUnit: { fontSize: 22, fontWeight: fonts.weight.body },
  bar: {
    height: 13,
    borderRadius: R.pill,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.yellow },
  heroNote: { color: colors.white, fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, marginTop: 8, opacity: 0.92 },
  statRow: { flexDirection: 'row', gap: 12 },
  stat: { padding: 14 },
  statV: { fontWeight: fonts.weight.heading, fontSize: 26, color: colors.ink },
  statK: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.7, marginTop: 5 },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -4, marginTop: 2 },
  secT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink },
  secMore: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.55 },
  appsRow: { flexDirection: 'row', gap: 11 },
  appTile: { paddingTop: 12, paddingBottom: 11, paddingHorizontal: 6, alignItems: 'center', gap: 7 },
  appNm: { fontWeight: fonts.weight.headingHeavy, fontSize: 12, color: colors.ink },
  lockBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.yellow,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGlyph: { fontSize: 10 },
  hint: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12, color: colors.ink, opacity: 0.6, textAlign: 'center', marginTop: -4 },
});

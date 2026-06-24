/**
 * Home tab, rebuilt to match design/BrainfuelRN/screens/HomeScreen.tsx.
 * Wired to real data from getSettings() and isBlockingActive().
 * Reloads on every tab focus via useFocusEffect.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius as R,
  sticker,
  fonts,
  spacing,
  Sticker,
  Button,
  TopBar,
  Mascot,
  Bubble,
} from '../../src/ui';
import {
  getSettings,
  getWeeklyActivity,
  getActivityTrend,
  UserSettings,
  DayStat,
  ActivityTrend,
} from '../../src/services/storage';
import { isBlockingActive } from '../../src/services/screenTimeBlocking';
import { getBlockGroups } from '../../src/services/blockGroups';

// Evergreen motivational lines, cycled automatically. Data-driven lines that
// reflect the user's real week are prepended in buildMascotLines().
const MOTIVATION_DEFAULT = [
  'Every quiz makes your brain a little sharper.',
  'Resisting the scroll is a superpower. 💪',
  'Future you says thanks for this one. 🙌',
  'Small wins stack up. Keep going!',
  'Focus is a muscle, and you are training it.',
];

/**
 * Build the mascot's rotating lines. When there is real activity to celebrate,
 * personal lines come first; otherwise it falls back to the evergreen set.
 */
function buildMascotLines(
  settings: UserSettings,
  weekResisted: number,
  trend: ActivityTrend | null,
): string[] {
  if (settings.gamesPlayed === 0) {
    return ['Welcome! Answer a quiz to earn screen time. 🎉'];
  }
  const personal: string[] = [];
  if (weekResisted > 0) {
    personal.push(
      `You resisted ${weekResisted} open${weekResisted === 1 ? '' : 's'} this week. Strong! 💪`,
    );
  }
  if (trend && trend.percentChange !== null && trend.percentChange < 0) {
    personal.push(`Down ${Math.abs(trend.percentChange)}% from last week. Keep it rolling! 📉`);
  }
  return [...personal, ...MOTIVATION_DEFAULT];
}

/** Week-over-week wording for the Home snapshot. Fewer opens is the win. */
function trendLabel(trend: ActivityTrend | null): string {
  if (!trend || trend.percentChange === null) return 'Building your baseline';
  const pct = Math.abs(trend.percentChange);
  return trend.percentChange <= 0
    ? `${pct}% fewer than last week`
    : `${pct}% more than last week`;
}

/** Green when opens dropped, warm when they rose, muted while building a baseline. */
function trendColor(trend: ActivityTrend | null): string {
  if (!trend || trend.percentChange === null) return colors.ink;
  return trend.percentChange <= 0 ? colors.teal : colors.coral;
}

const SETTINGS_EMPTY: UserSettings = {
  blockedApps: [],
  gameCategory: 'random',
  questionCount: 3,
  totalUnlocks: 0,
  totalBlocked: 0,
  gamesPlayed: 0,
  minutes: 0,
  xp: 0,
  owned: [],
  doubleBoost: false,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>(SETTINGS_EMPTY);
  const [blocking, setBlocking] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);
  const [week, setWeek] = useState<DayStat[]>([]);
  const [trend, setTrend] = useState<ActivityTrend | null>(null);

  // Reload settings whenever this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const [s, groups, w, t] = await Promise.all([
          getSettings(),
          getBlockGroups(),
          getWeeklyActivity(),
          getActivityTrend(),
        ]);
        if (!alive) return;
        setSettings(s);
        setBlockedCount(
          groups.filter((g) => g.enabled).reduce((sum, g) => sum + g.appCount, 0),
        );
        setBlocking(isBlockingActive());
        setWeek(w);
        setTrend(t);
      })();
      return () => { alive = false; };
    }, []),
  );

  // This-week snapshot from real on-device activity.
  const weekOpens = week.reduce((sum, d) => sum + d.attempts, 0);
  const weekResisted = Math.max(0, weekOpens - week.reduce((sum, d) => sum + d.unlocks, 0));

  // Mascot message: one line per day, stable until the date rolls over, picked
  // from the personal + evergreen set.
  const mascotLines = buildMascotLines(settings, weekResisted, trend);
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const tipText = mascotLines[dayIndex % mascotLines.length];

  return (
    <View style={styles.screen}>
      {/* safe-area top pad + top bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.bg }}>
        <TopBar brand="Brainfuel" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Mascot + speech bubble */}
        <View style={styles.mascotRow}>
          <Mascot size={92} expr="happy" />
          <Bubble text={tipText} style={{ flex: 1 }} />
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <Sticker
            bg={colors.yellow}
            radius={R.lg}
            offset={sticker.shadow.sm}
            style={{ flex: 1 }}
            innerStyle={styles.stat}
          >
            <Text style={styles.statV}>{settings.totalUnlocks}</Text>
            <Text style={styles.statK}>Quizzes won</Text>
          </Sticker>
          <Sticker
            bg={colors.teal}
            radius={R.lg}
            offset={sticker.shadow.sm}
            style={{ flex: 1 }}
            innerStyle={styles.stat}
          >
            <Text style={[styles.statV, { color: colors.white }]}>{settings.gamesPlayed}</Text>
            <Text style={[styles.statK, { color: colors.white, opacity: 0.9 }]}>Games played</Text>
          </Sticker>
        </View>

        {/* Weekly snapshot, tappable into the full Stats tab */}
        <Pressable onPress={() => router.push('/(tabs)/stats' as any)}>
          <Sticker bg={colors.paper} radius={R.xl} innerStyle={styles.snapCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapLabel}>THIS WEEK</Text>
              <Text style={styles.snapBig}>
                {weekOpens}
                <Text style={styles.snapUnit}> open{weekOpens === 1 ? '' : 's'}</Text>
              </Text>
              <Text style={[styles.snapTrend, { color: trendColor(trend) }]}>
                {trendLabel(trend)}
              </Text>
            </View>
            <Ionicons name="bar-chart" size={22} color={colors.ink} />
          </Sticker>
        </Pressable>

        {/* Locked apps section */}
        <View style={styles.secRow}>
          <Text style={styles.secT}>Locked apps</Text>
          <Pressable onPress={() => router.push('/(tabs)/blocked' as any)}>
            <Text style={styles.secMore}>Manage {'>'}</Text>
          </Pressable>
        </View>

        {/* iOS keeps the chosen apps private (even from us), so we show the live
            shield status and a real count instead of guessing app identities. */}
        <Pressable onPress={() => router.push('/(tabs)/blocked' as any)}>
          <Sticker bg={colors.paper} radius={R.xl} innerStyle={styles.shieldCard}>
            <View
              style={[
                styles.shieldIcon,
                { backgroundColor: blocking ? colors.purple : colors.bg2 },
              ]}
            >
              <Ionicons
                name={blocking ? 'shield-checkmark' : 'shield-outline'}
                size={26}
                color={blocking ? colors.white : colors.ink}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shieldTitle}>
                {blocking
                  ? `${blockedCount} app${blockedCount !== 1 ? 's' : ''} shielded`
                  : blockedCount > 0
                  ? 'Shield is off'
                  : 'No apps chosen yet'}
              </Text>
              <Text style={styles.shieldSub}>
                {blocking
                  ? 'Open one to earn time with a quiz'
                  : 'Tap to set up Screen Time blocking'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.ink} />
          </Sticker>
        </Pressable>

        {/* Play CTA */}
        <Button
          variant="coral"
          lg
          block
          label="Play to unlock +15 min"
          onPress={() => router.push('/quiz')}
        >
          <Mascot size={26} sprout={false} />
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 130,
    gap: spacing.lg,
  },

  // Mascot row
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4 },

  // Stat tiles
  statRow: { flexDirection: 'row', gap: 12 },
  stat: { padding: 14 },
  statV: { fontFamily: fonts.heading, fontSize: 26, color: colors.ink },
  statK: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 5,
  },

  // Weekly snapshot card
  snapCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  snapLabel: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    letterSpacing: 0.5,
    color: colors.ink,
    opacity: 0.55,
  },
  snapBig: { fontFamily: fonts.heading, fontSize: 30, color: colors.ink, marginTop: 2 },
  snapUnit: { fontFamily: fonts.body, fontSize: 16 },
  snapTrend: { fontFamily: fonts.heading, fontSize: 13, marginTop: 2 },

  // Section header
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
    marginTop: 2,
  },
  secT: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  secMore: { fontFamily: fonts.body, fontSize: 12.5, color: colors.ink, opacity: 0.55 },

  // Shield status card
  shieldCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shieldIcon: {
    width: 50,
    height: 50,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  shieldSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Sticker } from '../../src/ui';
import { colors, radius as R, fonts, spacing } from '../../src/ui/theme';
import {
  getSettings,
  getWeeklyActivity,
  getActivityTrend,
  brainLevel,
  MINUTES_RECLAIMED_PER_RESIST,
  UserSettings,
  DayStat,
  ActivityTrend,
} from '../../src/services/storage';
import { ECONOMY_ENABLED } from '../../src/config/featureFlags';

// Apple does not expose system Screen Time to third party apps, so every number
// here comes from this device's own Brainfuel activity. The headline metric is
// how often you opened an app we block, with a week-over-week trend, the same
// framing focus apps use since a true "before Brainfuel" baseline never existed.

/** Format a minute count as "45m" or "1h 5m". */
function fmtMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [week, setWeek] = useState<DayStat[]>([]);
  const [trend, setTrend] = useState<ActivityTrend | null>(null);

  const load = async () => {
    const [s, w, t] = await Promise.all([
      getSettings(),
      getWeeklyActivity(),
      getActivityTrend(),
    ]);
    setSettings(s);
    setWeek(w);
    setTrend(t);
  };

  // Reload whenever the tab gains focus so numbers stay fresh.
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, []),
  );

  if (!settings) return <View style={styles.screen} />;

  // Today is the last day in the 7-day window.
  const today = week[week.length - 1];
  const openedToday = today?.attempts ?? 0;
  const resistedToday = today ? Math.max(0, today.attempts - today.unlocks) : 0;
  const earnedToday = today ? today.unlocks * 15 : 0;

  // Weekly chart from real per-day opens. Guard the divisor so an empty week
  // does not divide by zero.
  const maxBar = Math.max(1, ...week.map((d) => d.attempts));
  const weekOpens = week.reduce((sum, d) => sum + d.attempts, 0);
  const weekUnlocks = week.reduce((sum, d) => sum + d.unlocks, 0);
  // Times you reached for a blocked app but did not unlock it: the focus win.
  const weekResisted = Math.max(0, weekOpens - weekUnlocks);
  const reclaimedWeek = weekResisted * MINUTES_RECLAIMED_PER_RESIST;

  // All-time quiz record. gamesPlayed = wins + losses, so win rate is honest.
  const played = settings.gamesPlayed;
  const won = settings.totalUnlocks;
  const lost = settings.totalBlocked;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  // Brain level (economy only).
  const { level, xpIntoLevel, xpForLevel } = brainLevel(settings.xp);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        {/* Header */}
        <View>
          <Text style={styles.pageT}>Your stats</Text>
          <Text style={styles.pageSub}>How often you reached for a blocked app</Text>
        </View>

        {/* Today summary */}
        <Sticker radius={R.xl} innerStyle={{ padding: 16 }}>
          <Text style={styles.cardT}>Today</Text>
          <View style={styles.todayRow}>
            <MiniStat v={`${openedToday}`} k="Opened" color={colors.coral} />
            <View style={styles.todayDivider} />
            <MiniStat v={`${resistedToday}`} k="Resisted" color={colors.teal} />
            <View style={styles.todayDivider} />
            <MiniStat v={fmtMinutes(earnedToday)} k="Earned" color={colors.purple} />
          </View>
        </Sticker>

        {/* Daily opens of a blocked app, from real on-device activity */}
        <Sticker radius={R.xl} innerStyle={{ padding: 16 }}>
          <View style={styles.secRow}>
            <Text style={styles.cardT}>Blocked apps opened</Text>
            <Text style={styles.cardMore}>{weekOpens} this week</Text>
          </View>
          <View style={styles.chart}>
            {week.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View
                  style={[
                    styles.barv,
                    {
                      height: `${Math.max(6, (d.attempts / maxBar) * 100)}%` as any,
                      backgroundColor:
                        d.attempts > 0 && d.attempts === maxBar ? colors.purple : colors.coral,
                    },
                  ]}
                />
                <Text style={styles.chartLbl}>{d.label}</Text>
              </View>
            ))}
          </View>
          {trend ? <TrendPill trend={trend} /> : null}
          <Text style={styles.chartNote}>
            Each time you open an app Brainfuel blocks. Apple keeps your total Screen Time private to other apps.
          </Text>
        </Sticker>

        {/* Time reclaimed (estimate) */}
        <Sticker bg={colors.teal} radius={R.xl} innerStyle={{ padding: 18 }}>
          <Text style={styles.heroLabel}>TIME RECLAIMED THIS WEEK</Text>
          <Text style={styles.heroBig}>≈ {fmtMinutes(reclaimedWeek)}</Text>
          <Text style={styles.heroNote}>
            Estimated from {weekResisted} resisted open{weekResisted === 1 ? '' : 's'} at about {MINUTES_RECLAIMED_PER_RESIST} min each.
          </Text>
        </Sticker>

        {/* Quiz performance */}
        <Sticker radius={R.xl} innerStyle={{ padding: 16 }}>
          <View style={styles.secRow}>
            <Text style={styles.cardT}>Quiz performance</Text>
            <Text style={styles.cardMore}>{winRate}% win rate</Text>
          </View>
          <View style={styles.quizGrid}>
            <QuizStat v={`${played}`} k="Played" />
            <QuizStat v={`${won}`} k="Won" color={colors.teal} />
            <QuizStat v={`${lost}`} k="Lost" color={colors.pink} />
            <QuizStat v={`${winRate}%`} k="Win rate" />
          </View>
        </Sticker>

        {/* Brain level (part of the minutes economy; hidden until launch). */}
        {ECONOMY_ENABLED && (
          <Sticker bg={colors.purple} radius={R.xl} innerStyle={{ padding: 18 }}>
            <Text style={styles.heroLabel}>BRAIN LEVEL</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Text style={styles.heroBig}>Lv {level}</Text>
              <Text style={styles.heroSide}>{settings.xp} XP total</Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${xpIntoLevel}%` }]} />
            </View>
            <Text style={styles.heroNote}>
              {xpForLevel - xpIntoLevel} XP to level {level + 1}
            </Text>
          </Sticker>
        )}
      </ScrollView>
    </View>
  );
}

// MiniStat: one labelled number in the Today row.
function MiniStat({ v, k, color }: { v: string; k: string; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniV, { color }]}>{v}</Text>
      <Text style={styles.miniK}>{k}</Text>
    </View>
  );
}

// QuizStat: one cell of the quiz-performance grid.
function QuizStat({ v, k, color }: { v: string; k: string; color?: string }) {
  return (
    <View style={styles.quizCell}>
      <Text style={[styles.quizV, color ? { color } : null]}>{v}</Text>
      <Text style={styles.quizK}>{k}</Text>
    </View>
  );
}

// TrendPill: week-over-week change in how often a blocked app was opened. Fewer
// opens is the win, so a drop is shown in the positive teal.
function TrendPill({ trend }: { trend: ActivityTrend }) {
  if (trend.percentChange === null) {
    return (
      <View style={[styles.trend, { backgroundColor: colors.bg2 }]}>
        <Ionicons name="sparkles" size={15} color={colors.ink} />
        <Text style={styles.trendText}>Building your baseline</Text>
      </View>
    );
  }
  const down = trend.percentChange <= 0;
  return (
    <View style={[styles.trend, { backgroundColor: down ? colors.teal : colors.pink }]}>
      <Ionicons
        name={down ? 'trending-down' : 'trending-up'}
        size={15}
        color={colors.white}
      />
      <Text style={[styles.trendText, { color: colors.white }]}>
        {Math.abs(trend.percentChange)}% {down ? 'fewer' : 'more'} than last week
      </Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 130, gap: spacing.lg },

  pageT: { fontWeight: fonts.weight.heading, fontSize: 30, color: colors.ink },
  pageSub: {
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },

  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink },
  cardMore: {
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.55,
  },

  // Today row
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  todayDivider: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: colors.ink,
    opacity: 0.12,
    borderRadius: 1,
  },
  miniStat: { flex: 1, alignItems: 'center', gap: 4 },
  miniV: { fontWeight: fonts.weight.heading, fontSize: 28 },
  miniK: {
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.65,
  },

  // Weekly chart. marginTop keeps tall bars clear of the title row.
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 130,
    marginTop: 16,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    gap: 6,
  },
  barv: {
    width: '100%',
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    minHeight: 6,
  },
  chartLbl: {
    fontWeight: fonts.weight.heading,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.6,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  trendText: {
    fontWeight: fonts.weight.heading,
    fontSize: 13,
    color: colors.ink,
  },
  chartNote: {
    fontWeight: fonts.weight.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 10,
    lineHeight: 15,
  },

  // Quiz performance grid
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    rowGap: 14,
  },
  quizCell: { width: '50%', gap: 3 },
  quizV: { fontWeight: fonts.weight.heading, fontSize: 24, color: colors.ink },
  quizK: {
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.65,
  },

  // Hero cards (time reclaimed + brain level)
  heroLabel: {
    color: colors.white,
    fontWeight: fonts.weight.headingHeavy,
    fontSize: 12.5,
    letterSpacing: 0.5,
    opacity: 0.92,
  },
  heroBig: { color: colors.white, fontWeight: fonts.weight.heading, fontSize: 46, marginTop: 2 },
  heroSide: {
    color: colors.white,
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 14,
    opacity: 0.92,
  },
  heroNote: {
    color: colors.white,
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 12.5,
    marginTop: 8,
    opacity: 0.92,
    lineHeight: 17,
  },
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
});

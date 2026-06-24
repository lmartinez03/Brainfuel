// screens/StatsScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sticker from '../components/Sticker';
import AppIcon from '../components/AppIcon';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { WEEK_SAVED, APPS, AppState } from '../data';

export default function StatsScreen({ state }: { state: AppState }) {
  const insets = useSafeAreaInsets();
  const max = Math.max(...WEEK_SAVED.map((d) => d.v));
  const level = Math.floor(state.xp / 100) + 1;
  const levelPct = state.xp % 100;
  const totalWeek = WEEK_SAVED.reduce((s, d) => s + d.v, 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <View>
          <Text style={styles.pageT}>Your stats</Text>
          <Text style={styles.pageSub}>Look how much brain you've flexed 🧠</Text>
        </View>

        {/* time saved chart */}
        <Sticker radius={R.xl} innerStyle={{ padding: 16 }}>
          <View style={styles.secRow}>
            <Text style={styles.cardT}>Time saved this week</Text>
            <Text style={styles.cardMore}>
              {Math.floor(totalWeek / 60)}h {totalWeek % 60}m
            </Text>
          </View>
          <View style={styles.chart}>
            {WEEK_SAVED.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View
                  style={[
                    styles.barv,
                    {
                      height: `${(d.v / max) * 100}%`,
                      backgroundColor: d.v === max ? colors.purple : colors.coral,
                    },
                  ]}
                />
                <Text style={styles.chartLbl}>{d.d}</Text>
              </View>
            ))}
          </View>
        </Sticker>

        {/* level */}
        <Sticker bg={colors.teal} radius={R.xl} innerStyle={{ padding: 18 }}>
          <Text style={styles.heroLabel}>BRAIN LEVEL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={styles.heroBig}>Lv {level}</Text>
            <Text style={styles.heroSide}>{state.xp} XP total</Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${levelPct}%` }]} />
          </View>
          <Text style={styles.heroNote}>{100 - levelPct} XP to level {level + 1}</Text>
        </Sticker>

        {/* stat grid */}
        <View style={styles.grid}>
          <StatTile bg={colors.coral} white v={`${state.streak} 🔥`} k="Day streak" />
          <StatTile bg={colors.yellow} v="94%" k="Quiz accuracy" />
          <StatTile bg={colors.paper} v="128" k="Quizzes won" />
          <StatTile bg={colors.paper} v={`${Math.floor(state.saved / 60)}h ${state.saved % 60}m`} k="Saved today" />
        </View>

        {/* most tempting */}
        <Text style={styles.secT}>Most tempting app</Text>
        <Sticker radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.item}>
          <AppIcon grad={APPS[0].grad} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemNm}>{APPS[0].nm}</Text>
            <Text style={styles.itemSub}>You tried to open it 23× this week 👀</Text>
          </View>
          <Text style={styles.bigNum}>23</Text>
        </Sticker>
      </ScrollView>
    </View>
  );
}

function StatTile({ bg, v, k, white }: { bg: string; v: string; k: string; white?: boolean }) {
  return (
    <Sticker bg={bg} radius={R.lg} offset={sticker.shadow.sm} style={{ width: '47.5%' }} innerStyle={{ padding: 14 }}>
      <Text style={[styles.tileV, white && { color: colors.white }]}>{v}</Text>
      <Text style={[styles.tileK, white && { color: colors.white, opacity: 0.9 }]}>{k}</Text>
    </Sticker>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 130, gap: spacing.lg },
  pageT: { fontWeight: fonts.weight.heading, fontSize: 30, color: colors.ink },
  pageSub: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, color: colors.ink, opacity: 0.6, marginTop: 4 },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink },
  cardMore: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.55 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 130, paddingTop: 8 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6 },
  barv: { width: '100%', borderWidth: 2.5, borderColor: colors.ink, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, minHeight: 6 },
  chartLbl: { fontWeight: fonts.weight.heading, fontSize: 11, color: colors.ink, opacity: 0.6 },
  heroLabel: { color: colors.white, fontWeight: fonts.weight.headingHeavy, fontSize: 12.5, letterSpacing: 0.5, opacity: 0.92 },
  heroBig: { color: colors.white, fontWeight: fonts.weight.heading, fontSize: 46 },
  heroSide: { color: colors.white, fontWeight: fonts.weight.bodyHeavy, fontSize: 14, opacity: 0.92 },
  heroNote: { color: colors.white, fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, marginTop: 8, opacity: 0.92 },
  bar: { height: 13, borderRadius: R.pill, marginTop: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 2, borderColor: colors.ink, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.yellow },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tileV: { fontWeight: fonts.weight.heading, fontSize: 26, color: colors.ink },
  tileK: { fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, color: colors.ink, opacity: 0.7, marginTop: 5 },
  secT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink, marginBottom: -4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  itemNm: { fontWeight: fonts.weight.heading, fontSize: 16, color: colors.ink },
  itemSub: { fontWeight: fonts.weight.body, fontSize: 12, color: colors.ink, opacity: 0.6, marginTop: 2 },
  bigNum: { fontWeight: fonts.weight.heading, fontSize: 22, color: colors.coral },
});

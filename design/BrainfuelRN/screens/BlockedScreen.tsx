// screens/BlockedScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sticker from '../components/Sticker';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import Toggle from '../components/Toggle';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { APPS, AppState } from '../data';

type Props = {
  state: AppState;
  onToggle: (id: string) => void;
  onPlay: () => void;
};

export default function BlockedScreen({ state, onToggle, onPlay }: Props) {
  const insets = useSafeAreaInsets();
  const count = Object.values(state.blocked).filter(Boolean).length;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <View>
          <Text style={styles.pageT}>Blocked apps</Text>
          <Text style={styles.pageSub}>{count} apps locked · earn time with quizzes</Text>
        </View>

        <Sticker bg={colors.purple} radius={R.xl} innerStyle={styles.hero}>
          <Text style={styles.heroLabel}>CURRENTLY SHIELDING YOU FROM</Text>
          <Text style={styles.heroBig}>
            {count}
            <Text style={styles.heroUnit}> apps</Text>
          </Text>
          <Text style={styles.heroNote}>That's ~3h 41m of scrolling intercepted today 🛡️</Text>
        </Sticker>

        <Text style={styles.secT}>Manage apps</Text>
        <View style={{ gap: 10 }}>
          {APPS.map((a) => (
            <Sticker key={a.id} radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.item}>
              <AppIcon grad={a.grad} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNm}>{a.nm}</Text>
                <Text style={styles.itemSub}>
                  {a.cat} · {a.mins}m used this week
                </Text>
              </View>
              <Toggle value={!!state.blocked[a.id]} onChange={() => onToggle(a.id)} />
            </Sticker>
          ))}
        </View>

        <Button variant="paper" block iconName="add" label="Add another app" />
        <Button variant="coral" lg block label="🧠 Earn time now" onPress={onPlay} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 130, gap: spacing.lg },
  pageT: { fontWeight: fonts.weight.heading, fontSize: 30, color: colors.ink },
  pageSub: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, color: colors.ink, opacity: 0.6, marginTop: 4 },
  hero: { padding: 18 },
  heroLabel: { color: colors.white, fontWeight: fonts.weight.headingHeavy, fontSize: 12.5, letterSpacing: 0.5, opacity: 0.92 },
  heroBig: { color: colors.white, fontWeight: fonts.weight.heading, fontSize: 44, marginTop: 4 },
  heroUnit: { fontSize: 20, fontWeight: fonts.weight.body },
  heroNote: { color: colors.white, fontWeight: fonts.weight.bodyHeavy, fontSize: 12.5, opacity: 0.9, marginTop: 4 },
  secT: { fontWeight: fonts.weight.heading, fontSize: 17, color: colors.ink, marginBottom: -4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  itemNm: { fontWeight: fonts.weight.heading, fontSize: 16, color: colors.ink },
  itemSub: { fontWeight: fonts.weight.body, fontSize: 12, color: colors.ink, opacity: 0.6, marginTop: 2 },
});

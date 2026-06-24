// screens/LockScreen.tsx
// Full-screen takeover when a blocked app is opened.
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mascot from '../components/Mascot';
import Bubble from '../components/Bubble';
import Button from '../components/Button';
import Chip from '../components/Chip';
import AppIcon from '../components/AppIcon';
import { colors, fonts, spacing } from '../theme';
import { AppItem } from '../data';

type Props = {
  app: AppItem;
  onPlay: () => void;
  onDismiss: () => void;
};

export default function LockScreen({ app, onPlay, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 40 }]}
      >
        <AppIcon grad={app.grad} size={64} radius={20} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>{app.nm} is locked</Text>
          <Text style={styles.sub}>You've used today's free time on {app.cat.toLowerCase()} apps.</Text>
        </View>
        <Mascot size={120} expr="wink" />
        <Bubble
          text="Beat a quick quiz and I'll unlock 15 more minutes for you. Deal? 🤝"
          tail="none"
          style={{ maxWidth: 290 }}
        />
        <Button variant="yellow" lg block label="🧠 Play to unlock +15 min" onPress={onPlay} />
        <Chip bg="rgba(255,255,255,0.15)" textColor={colors.white} onPress={onDismiss}>
          <Text style={[styles.chipText, { color: colors.white }]}>Not now, keep me blocked</Text>
        </Chip>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.purple },
  content: { paddingHorizontal: 18, alignItems: 'center', gap: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  title: { fontWeight: fonts.weight.heading, fontSize: 30, color: colors.white, textAlign: 'center' },
  sub: { fontWeight: fonts.weight.bodyHeavy, fontSize: 15, color: colors.white, opacity: 0.85, textAlign: 'center', marginTop: 6 },
  chipText: { fontWeight: fonts.weight.headingHeavy, fontSize: 14 },
});

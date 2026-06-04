import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header } from '../src/components/Header';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, radius, shadow } from '../src/theme';

const STEPS = [
  {
    num: '1',
    icon: '📱',
    title: 'Open the Shortcuts App',
    detail: 'Find the "Shortcuts" app on your iPhone (it comes pre-installed). Tap Automation at the bottom.',
    accent: colors.brand.cyan,
  },
  {
    num: '2',
    icon: '➕',
    title: 'Create New Automation',
    detail: 'Tap the "+" button in the top right corner, then choose "Personal Automation".',
    accent: colors.brand.orange,
  },
  {
    num: '3',
    icon: '🔍',
    title: 'Choose "App" Trigger',
    detail: 'Scroll down and select "App" as the trigger. Then select the app you want to block (e.g. Instagram).',
    accent: colors.brand.purple,
  },
  {
    num: '4',
    icon: '⚡',
    title: 'Set "Is Opened" Condition',
    detail: 'Make sure "Is Opened" is checked. Tap Next.',
    accent: colors.brand.yellow,
  },
  {
    num: '5',
    icon: '🧠',
    title: 'Add "Open URL" Action',
    detail: 'Tap "Add Action", search for "Open URL". Set the URL to:\nbrainfuel://block?app=instagram\n(Replace "instagram" with the app name)',
    accent: colors.brand.green,
    code: 'brainfuel://block?app=instagram',
  },
  {
    num: '6',
    icon: '🔕',
    title: 'Disable "Ask Before Running"',
    detail: 'Toggle OFF "Ask Before Running" so the automation fires silently. Tap Done.',
    accent: colors.brand.coral,
  },
  {
    num: '7',
    icon: '✅',
    title: 'You\'re All Set!',
    detail: 'Now whenever you open that app, iOS will launch Brainfuel first. Earn your access with a quiz!',
    accent: colors.brand.cyan,
  },
];

const SUPPORTED_APPS = [
  { name: 'Instagram', scheme: 'brainfuel://block?app=instagram', emoji: '📸' },
  { name: 'TikTok', scheme: 'brainfuel://block?app=tiktok', emoji: '🎵' },
  { name: 'X / Twitter', scheme: 'brainfuel://block?app=twitter', emoji: '🐦' },
  { name: 'YouTube', scheme: 'brainfuel://block?app=youtube', emoji: '▶️' },
  { name: 'Reddit', scheme: 'brainfuel://block?app=reddit', emoji: '🤖' },
  { name: 'Snapchat', scheme: 'brainfuel://block?app=snapchat', emoji: '👻' },
  { name: 'Facebook', scheme: 'brainfuel://block?app=facebook', emoji: '👍' },
  { name: 'Discord', scheme: 'brainfuel://block?app=discord', emoji: '💬' },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    Haptics.selectionAsync();
    setExpanded((e) => !e);
  };

  return (
    <Pressable onPress={toggle} style={[styles.stepCard, { borderColor: expanded ? step.accent + '50' : colors.border.subtle }]}>
      {expanded && (
        <LinearGradient
          colors={[`${step.accent}12`, `${step.accent}04`]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={[styles.stepNum, { backgroundColor: step.accent + '22', borderColor: step.accent + '40' }]}>
        <Text style={[styles.stepNumText, { color: step.accent }]}>{step.num}</Text>
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepIcon}>{step.icon}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text.tertiary}
          />
        </View>
        {expanded && (
          <View style={styles.stepBody}>
            <Text style={styles.stepDetail}>{step.detail}</Text>
            {step.code && (
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{step.code}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function ShortcutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const handleTest = () => {
    router.push({ pathname: '/quiz', params: { app: 'test', demo: '1' } });
  };

  const openShortcutsApp = () => {
    Linking.openURL('shortcuts://').catch(() => {
      Linking.openURL('https://apps.apple.com/app/shortcuts/id1462947752');
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Set Up Shortcuts" showBack subtitle="Step-by-step guide" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['#1C2035', '#0D0F1A']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.heroEmoji}>🔗</Text>
          <Text style={styles.heroTitle}>iOS Shortcuts Integration</Text>
          <Text style={styles.heroSub}>
            Use iPhone's built-in Shortcuts app to automatically launch Brainfuel whenever you open a blocked app, just like the "one sec" app.
          </Text>
          <Pressable onPress={openShortcutsApp} style={styles.openShortcutsBtn}>
            <LinearGradient
              colors={colors.gradient.purple}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="link" size={16} color="#fff" />
            <Text style={styles.openShortcutsBtnText}>Open Shortcuts App</Text>
          </Pressable>
        </View>

        {/* Steps */}
        <Text style={styles.sectionLabel}>Step-by-Step Guide</Text>
        <Text style={styles.tapHint}>Tap each step to expand instructions</Text>
        {STEPS.map((step, i) => (
          <StepCard key={i} step={step} index={i} />
        ))}

        {/* Deep link reference */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Deep Link Reference</Text>
        <Text style={styles.tapHint}>Copy these URLs for the "Open URL" action</Text>
        {SUPPORTED_APPS.map((app) => (
          <View key={app.name} style={styles.deepLinkRow}>
            <Text style={styles.deepLinkEmoji}>{app.emoji}</Text>
            <View style={styles.deepLinkInfo}>
              <Text style={styles.deepLinkName}>{app.name}</Text>
              <Text style={styles.deepLinkUrl}>{app.scheme}</Text>
            </View>
          </View>
        ))}

        {/* Test CTA */}
        <View style={styles.testSection}>
          <LinearGradient
            colors={['rgba(0,245,255,0.08)', 'rgba(0,245,255,0.02)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.testTitle}>🧪 Test It Out</Text>
          <Text style={styles.testSub}>See exactly what happens when you try to open a blocked app</Text>
          <PrimaryButton
            label="Launch Demo Quiz"
            onPress={handleTest}
            variant="cyan"
            size="md"
          />
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Ionicons name="information-circle" size={18} color={colors.brand.cyan} />
          <Text style={styles.noteText}>
            iOS Shortcuts automations run 100% natively. Brainfuel never has access to your other apps. This is purely a URL-scheme trigger.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  hero: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.md,
  },
  heroEmoji: { fontSize: 48, marginBottom: spacing.md },
  heroTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  openShortcutsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  openShortcutsBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: 4,
  },
  tapHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    backgroundColor: colors.bg.card,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 14,
  },
  stepContent: { flex: 1 },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: { fontSize: 18 },
  stepTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  stepBody: { marginTop: spacing.sm },
  stepDetail: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  codeText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 13,
    color: colors.brand.cyan,
  },
  deepLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  deepLinkEmoji: { fontSize: 24 },
  deepLinkInfo: { flex: 1 },
  deepLinkName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.text.primary,
  },
  deepLinkUrl: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 11,
    color: colors.brand.cyanDim,
    marginTop: 2,
  },
  testSection: {
    marginTop: spacing.xl,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  testTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
  },
  testSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.xl,
    padding: spacing.base,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  noteText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

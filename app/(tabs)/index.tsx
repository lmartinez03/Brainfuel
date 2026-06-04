import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../src/components/StatCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, radius, shadow } from '../../src/theme';
import { getSettings, UserSettings } from '../../src/services/storage';
import { CATEGORY_META } from '../../src/games';
import { CATEGORY_EMOJI } from '../../src/games/categoryMeta';

const BLOCKED_APP_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', twitter: '🐦', youtube: '▶️',
  reddit: '🤖', snapchat: '👻', facebook: '👍', pinterest: '📌',
  twitch: '🎮', discord: '💬', spotify: '🎧', netflix: '🎬',
};

const APP_NAMES: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', twitter: 'X / Twitter',
  youtube: 'YouTube', reddit: 'Reddit', snapchat: 'Snapchat',
  facebook: 'Facebook', pinterest: 'Pinterest', twitch: 'Twitch',
  discord: 'Discord', spotify: 'Spotify', netflix: 'Netflix',
};

function StreakFlame({ streak }: { streak: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak === 0) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [streak]);

  return (
    <Animated.View style={[styles.streakOrb, { transform: [{ scale: pulse }] }]}>
      <LinearGradient
        colors={['#FF6B35', '#FF3D00']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={styles.streakEmoji}>🔥</Text>
      <Text style={styles.streakNum}>{streak}</Text>
      <Text style={styles.streakLabel}>streak</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const blockedApps = settings?.blockedApps ?? [];
  const activeCategory = settings?.gameCategory ?? 'random';
  const categoryMeta = CATEGORY_META[activeCategory];
  const categoryEmoji = CATEGORY_EMOJI[activeCategory];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero gradient bg */}
      <LinearGradient
        colors={['#0D0F1A', '#0D1520', '#0D0F1A']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.4, 1]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.cyan} />
        }
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good hustle! 💪</Text>
              <Text style={styles.tagline}>Your brain's on fire today</Text>
            </View>
            <Pressable onPress={() => router.push('/paywall')} style={styles.proBadge}>
              <LinearGradient
                colors={colors.gradient.cyan}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.proText}>PRO</Text>
            </Pressable>
          </View>

          {/* Streak + Stats Row */}
          <View style={styles.statsRow}>
            <StreakFlame streak={settings?.streak ?? 0} />
            <View style={styles.statsRight}>
              <View style={styles.statsMini}>
                <StatCard
                  value={settings?.totalUnlocks ?? 0}
                  label="Unlocks"
                  icon="🔓"
                  accent={colors.brand.cyan}
                />
                <StatCard
                  value={settings?.totalBlocked ?? 0}
                  label="Blocked"
                  icon="🛡️"
                  accent={colors.brand.orange}
                />
              </View>
            </View>
          </View>

          {/* Quick-test CTA */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Test the quiz</Text>
            <Pressable
              onPress={() => router.push({ pathname: '/quiz', params: { app: 'test', demo: '1' } })}
              style={styles.quizCta}
            >
              <LinearGradient
                colors={['#1C2035', '#151829']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.quizCtaLeft}>
                <Text style={styles.quizCtaTitle}>
                  {categoryEmoji} {categoryMeta.label} Quiz
                </Text>
                <Text style={styles.quizCtaSubtitle}>
                  {settings?.questionCount ?? 3} questions · Tap to try it out
                </Text>
              </View>
              <View style={styles.quizCtaArrow}>
                <LinearGradient
                  colors={colors.gradient.cyan}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="play" size={16} color="#0D0F1A" />
              </View>
            </Pressable>
          </View>

          {/* Blocked Apps */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Blocked Apps</Text>
              <Pressable onPress={() => router.push('/(tabs)/blocked')} style={styles.seeAll}>
                <Text style={styles.seeAllText}>Manage →</Text>
              </Pressable>
            </View>

            {blockedApps.length === 0 ? (
              <Pressable
                onPress={() => router.push('/(tabs)/blocked')}
                style={styles.emptyBlockCard}
              >
                <LinearGradient
                  colors={['rgba(0,245,255,0.06)', 'rgba(0,245,255,0.02)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.emptyBlockIcon}>🛡️</Text>
                <Text style={styles.emptyBlockTitle}>No apps blocked yet</Text>
                <Text style={styles.emptyBlockSub}>Add apps to start earning your screen time</Text>
              </Pressable>
            ) : (
              <View style={styles.blockedGrid}>
                {blockedApps.slice(0, 6).map((appId) => (
                  <View key={appId} style={styles.blockedChip}>
                    <LinearGradient
                      colors={['rgba(0,245,255,0.1)', 'rgba(0,245,255,0.04)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Text style={styles.blockedChipEmoji}>
                      {BLOCKED_APP_ICONS[appId] ?? '📱'}
                    </Text>
                    <Text style={styles.blockedChipName}>
                      {APP_NAMES[appId] ?? appId}
                    </Text>
                  </View>
                ))}
                {blockedApps.length > 6 && (
                  <View style={[styles.blockedChip, styles.moreChip]}>
                    <Text style={styles.moreChipText}>+{blockedApps.length - 6} more</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Shortcuts Setup Banner */}
          <Pressable onPress={() => router.push('/shortcuts')} style={styles.shortcutsBanner}>
            <LinearGradient
              colors={['#1A1E30', '#12162A']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.shortcutsLeft}>
              <Text style={styles.shortcutsTitle}>⚙️ Set Up Shortcuts</Text>
              <Text style={styles.shortcutsSub}>
                Connect Brainfuel to iOS automations so it activates when you open blocked apps.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.brand.cyan} />
          </Pressable>

          {/* Bottom spacing */}
          <View style={{ height: spacing.xxl }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  proBadge: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadow.cyan,
  },
  proText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 13,
    color: colors.text.inverse,
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  streakOrb: {
    width: 90,
    height: 90,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...shadow.orange,
  },
  streakEmoji: { fontSize: 24, marginBottom: -2 },
  streakNum: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    color: '#fff',
    lineHeight: 30,
  },
  streakLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  statsRight: { flex: 1 },
  statsMini: { flexDirection: 'row', gap: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  seeAll: { paddingVertical: 4, paddingHorizontal: 8 },
  seeAllText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.brand.cyan,
  },
  quizCta: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.md,
  },
  quizCtaLeft: { flex: 1 },
  quizCtaTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
  },
  quizCtaSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 3,
  },
  quizCtaArrow: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBlockCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.accent,
    borderStyle: 'dashed',
  },
  emptyBlockIcon: { fontSize: 36, marginBottom: spacing.sm },
  emptyBlockTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyBlockSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  blockedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  blockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  blockedChipEmoji: { fontSize: 16 },
  blockedChipName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.brand.cyan,
  },
  moreChip: {
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.card,
  },
  moreChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.text.secondary,
  },
  shortcutsBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  shortcutsLeft: { flex: 1 },
  shortcutsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  shortcutsSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});

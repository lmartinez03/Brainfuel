/**
 * You / Profile tab (app/(tabs)/settings.tsx)
 *
 * Matches design/BrainfuelRN/screens/ProfileScreen.tsx.
 * Wired to real stats from src/services/storage.ts.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius as R,
  sticker,
  fonts,
  spacing,
  Sticker,
  Chip,
  Mascot,
} from '../../src/ui';
import { getSettings, brainLevel, UserSettings } from '../../src/services/storage';
import { ECONOMY_ENABLED, BADGES_ENABLED } from '../../src/config/featureFlags';
import { getNotificationStatus, ensureNotificationPermission } from '../../src/services/notifications';
import { restorePurchases } from '../../src/services/subscription';
import { LEGAL_URLS } from '../../src/config/legal';

// Badge definitions + unlock logic
type BadgeDef = { em: string; nm: string; on: (s: UserSettings) => boolean };

const BADGE_DEFS: BadgeDef[] = [
  { em: '🔥', nm: 'On a Roll',     on: (s) => s.totalUnlocks >= 10 },
  { em: '🧠', nm: 'Brainiac',      on: (s) => s.gamesPlayed >= 20 },
  { em: '⚡', nm: 'Quick Wit',     on: (s) => s.gamesPlayed >= 5 },
  { em: '🎯', nm: 'Perfect Quiz',  on: (s) => s.totalUnlocks >= 1 },
  { em: '🌙', nm: 'Night Owl',     on: (_s) => false },  // no time-of-day tracking yet
  { em: '💎', nm: 'Centurion',     on: (s) => s.gamesPlayed >= 100 },
];

const APP_VERSION = '1.0.0';

// SettingsRow: sticker-style row with optional right element
function SettingsRow({
  label,
  sub,
  right,
  onPress,
}: {
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const Container: React.ElementType = onPress ? Pressable : View;
  return (
    <Sticker radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.rowInner}>
      <Container
        style={styles.rowContent}
        onPress={onPress}
        android_ripple={null}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
        </View>
        {right !== undefined ? (
          right
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        ) : null}
      </Container>
    </Sticker>
  );
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notifsOn, setNotifsOn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
      getNotificationStatus().then(setNotifsOn);
    }, [])
  );

  // The same system permission the Blocked tab shows. Tapping requests it when
  // off (or opens Settings if iOS will not re-prompt), and opens Settings to
  // manage when on, since an app cannot revoke its own permission.
  const handleNotifications = async () => {
    if (notifsOn) {
      Linking.openSettings();
      return;
    }
    const ok = await ensureNotificationPermission();
    setNotifsOn(ok);
    if (!ok) Linking.openSettings();
  };

  const handleRestorePurchases = async () => {
    const result = await restorePurchases();
    Alert.alert(
      result.success ? 'Restored' : 'Restore Purchases',
      result.success
        ? 'Your subscription has been restored.'
        : result.error ?? 'No previous purchase was found for this Apple ID.',
    );
  };

  const handlePrivacy = () => {
    Linking.openURL(LEGAL_URLS.privacy);
  };

  const handleTerms = () => {
    Linking.openURL(LEGAL_URLS.terms);
  };

  // Derived values
  const xp = settings?.xp ?? 0;
  const { level } = brainLevel(xp);

  const badges = BADGE_DEFS.map((b) => ({
    em: b.em,
    nm: b.nm,
    on: settings ? b.on(settings) : false,
  }));
  const earnedCount = badges.filter((b) => b.on).length;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
      >
        {/* Avatar + identity */}
        <View style={styles.hero}>
          <Mascot size={120} expr="happy" />
          <Text style={styles.name}>Guest</Text>
          {ECONOMY_ENABLED && (
            <View style={styles.chipRow}>
              <Chip bg={colors.purple}>
                <Text style={[styles.chipText, { color: colors.white }]}>
                  Brain Lv {level}
                </Text>
              </Chip>
            </View>
          )}
        </View>

        {/* Badges (achievements, hidden for launch via BADGES_ENABLED) */}
        {BADGES_ENABLED && (
          <>
            <View style={styles.secRow}>
              <Text style={styles.secTitle}>Badges</Text>
              <Text style={styles.secMore}>
                {earnedCount} of {badges.length}
              </Text>
            </View>
            <View style={styles.badgeGrid}>
              {badges.map((b, i) => (
                <Sticker
                  key={i}
                  radius={R.md}
                  offset={sticker.shadow.sm}
                  style={{ width: '31%' }}
                  innerStyle={[styles.badge, !b.on && { opacity: 0.45 }]}
                >
                  <View
                    style={[
                      styles.badgeEmoji,
                      { backgroundColor: b.on ? colors.yellow : '#e7ddd0' },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{b.on ? b.em : '🔒'}</Text>
                  </View>
                  <Text style={styles.badgeLabel}>{b.nm}</Text>
                </Sticker>
              ))}
            </View>
          </>
        )}

        {/* Settings rows */}
        <Text style={styles.secTitle}>Settings</Text>
        <View style={styles.rowStack}>
          {/* Notifications (real iOS permission, matches the Blocked tab) */}
          <SettingsRow
            label="Notifications"
            sub={notifsOn ? 'On' : 'Off, tap to turn on'}
            onPress={handleNotifications}
          />

          {/* Subscription */}
          <SettingsRow
            label="Brainfuel Pro"
            sub="Manage subscription"
            onPress={() => router.push('/paywall')}
          />

          {/* Restore purchases */}
          <SettingsRow
            label="Restore purchases"
            onPress={handleRestorePurchases}
          />

          {/* Privacy */}
          <SettingsRow
            label="Privacy Policy"
            onPress={handlePrivacy}
          />

          {/* Terms */}
          <SettingsRow
            label="Terms of Service"
            onPress={handleTerms}
          />

          {/* Version (no chevron, no press) */}
          <SettingsRow
            label="Version"
            sub={APP_VERSION}
            right={<View />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 130,
    gap: spacing.lg,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontWeight: fonts.weight.heading,
    fontSize: 28,
    color: colors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipText: {
    fontWeight: fonts.weight.headingHeavy,
    fontSize: 14,
    color: colors.ink,
  },

  // Section header
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  secTitle: {
    fontWeight: fonts.weight.heading,
    fontSize: 17,
    color: colors.ink,
  },
  secMore: {
    fontWeight: fonts.weight.bodyHeavy,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.55,
  },

  // Badge grid
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  badge: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  badgeEmoji: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontWeight: fonts.weight.headingHeavy,
    fontSize: 11,
    color: colors.ink,
    textAlign: 'center',
  },

  // Settings rows
  rowStack: {
    gap: 10,
  },
  rowInner: {
    overflow: 'hidden',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: {
    fontWeight: fonts.weight.heading,
    fontSize: 16,
    color: colors.ink,
  },
  rowSub: {
    fontWeight: fonts.weight.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },
});

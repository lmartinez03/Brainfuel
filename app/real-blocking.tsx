import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../src/components/Header';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, radius, shadow } from '../src/theme';
import {
  isScreenTimeAvailable,
  requestScreenTimeAuthorization,
  blockSelectedApps,
  unlockForMinutes,
  SELECTION_ID,
} from '../src/services/screenTimeBlocking';

// The picker is a native view, so it only exists in a dev/EAS build.
let DeviceActivity: any = null;
try {
  DeviceActivity = require('react-native-device-activity');
} catch {
  DeviceActivity = null;
}

export default function RealBlockingScreen() {
  const insets = useSafeAreaInsets();
  const available = isScreenTimeAvailable();
  const [authorized, setAuthorized] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  // Expo Go (or any non-native build): explain why blocking is unavailable.
  if (!available) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Real iOS Blocking" showBack subtitle="Beta" />
        <View style={styles.notice}>
          <LinearGradient colors={['#1C2035', '#0D0F1A']} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.noticeEmoji}>🔒</Text>
          <Text style={styles.noticeTitle}>Needs a development build</Text>
          <Text style={styles.noticeBody}>
            True app blocking uses Apple's Screen Time API, which is native code and cannot run
            in Expo Go. Build the app with EAS and open it in the dev build to set this up.
          </Text>
          <Text style={styles.noticeBody}>
            Setup steps are in docs/real-blocking-setup.md.
          </Text>
        </View>
      </View>
    );
  }

  const SelectionView = DeviceActivity?.DeviceActivitySelectionView;

  const handleAuthorize = async () => {
    const ok = await requestScreenTimeAuthorization();
    setAuthorized(ok);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Real iOS Blocking" showBack subtitle="Beta" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.step}>
          <Text style={styles.stepTitle}>1. Grant Screen Time access</Text>
          <Text style={styles.stepBody}>
            iOS will ask permission for Brainfuel to manage app restrictions.
          </Text>
          <PrimaryButton
            label={authorized ? 'Permission granted' : 'Grant permission'}
            onPress={handleAuthorize}
            variant={authorized ? 'green' : 'cyan'}
            size="md"
          />
        </View>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>2. Choose apps to block</Text>
          <Text style={styles.stepBody}>
            Pick any apps on your device. iOS keeps the choice private, even from Brainfuel.
          </Text>
          {SelectionView ? (
            <View style={styles.picker}>
              <SelectionView
                style={StyleSheet.absoluteFillObject}
                familyActivitySelectionId={SELECTION_ID}
                onSelectionChange={() => setHasSelection(true)}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.step}>
          <Text style={styles.stepTitle}>3. Turn blocking on</Text>
          <Text style={styles.stepBody}>
            Shields the chosen apps. Opening one shows the Brainfuel lock screen instead.
          </Text>
          <PrimaryButton
            label="Block selected apps"
            onPress={blockSelectedApps}
            variant="coral"
            size="md"
            disabled={!hasSelection}
          />
          <View style={{ height: spacing.sm }} />
          <PrimaryButton
            label="Test a 15-minute unlock"
            onPress={() => unlockForMinutes(15)}
            variant="ghost"
            size="md"
          />
        </View>

        <View style={styles.tip}>
          <Ionicons name="information-circle" size={18} color={colors.brand.cyan} />
          <Text style={styles.tipText}>
            After a user passes a quiz, the app calls unlockForMinutes(15) to lift the shield,
            then iOS re-applies it automatically when the window ends.
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
  notice: {
    margin: spacing.base,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.md,
  },
  noticeEmoji: { fontSize: 44, marginBottom: spacing.md },
  noticeTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noticeBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  step: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  stepTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
  },
  stepBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  picker: {
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg.cardAlt,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

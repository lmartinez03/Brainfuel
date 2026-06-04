import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppBlockRow } from '../../src/components/AppBlockRow';
import { Header } from '../../src/components/Header';
import { colors, spacing, radius } from '../../src/theme';
import {
  getSettings,
  saveSettings,
  getCustomApps,
  addCustomApp,
  removeCustomApp,
  CustomApp,
} from '../../src/services/storage';

interface AppEntry {
  id: string;
  name: string;
  emoji: string;
  category: string;
  isCustom?: boolean;
}

const ALL_APPS: AppEntry[] = [
  { id: 'instagram', name: 'Instagram', emoji: '📸', category: 'Social' },
  { id: 'tiktok', name: 'TikTok', emoji: '🎵', category: 'Video' },
  { id: 'twitter', name: 'X / Twitter', emoji: '🐦', category: 'Social' },
  { id: 'youtube', name: 'YouTube', emoji: '▶️', category: 'Video' },
  { id: 'reddit', name: 'Reddit', emoji: '🤖', category: 'Social' },
  { id: 'snapchat', name: 'Snapchat', emoji: '👻', category: 'Messaging' },
  { id: 'facebook', name: 'Facebook', emoji: '👍', category: 'Social' },
  { id: 'pinterest', name: 'Pinterest', emoji: '📌', category: 'Visual' },
  { id: 'twitch', name: 'Twitch', emoji: '🎮', category: 'Video' },
  { id: 'discord', name: 'Discord', emoji: '💬', category: 'Messaging' },
  { id: 'spotify', name: 'Spotify', emoji: '🎧', category: 'Music' },
  { id: 'netflix', name: 'Netflix', emoji: '🎬', category: 'Video' },
  { id: 'threads', name: 'Threads', emoji: '🧵', category: 'Social' },
  { id: 'linkedin', name: 'LinkedIn', emoji: '💼', category: 'Professional' },
  { id: 'tumblr', name: 'Tumblr', emoji: '✏️', category: 'Social' },
];

export default function BlockedAppsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [customApps, setCustomApps] = useState<CustomApp[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScheme, setNewScheme] = useState('');

  useFocusEffect(
    useCallback(() => {
      getSettings().then((s) => setBlockedIds(new Set(s.blockedApps)));
      getCustomApps().then(setCustomApps);
    }, [])
  );

  const setBlocked = async (ids: Set<string>) => {
    setBlockedIds(ids);
    await saveSettings({ blockedApps: Array.from(ids) });
  };

  const handleToggle = async (appId: string, val: boolean) => {
    const updated = new Set(blockedIds);
    if (val) updated.add(appId);
    else updated.delete(appId);
    await setBlocked(updated);
  };

  const handleAddApp = async () => {
    const name = newName.trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (!name || !id) return;

    const exists =
      ALL_APPS.some((a) => a.id === id) || customApps.some((a) => a.id === id);
    if (exists) {
      Alert.alert('Already in your list', `"${name}" is already here. Find it below and switch it on.`);
      resetAddForm();
      return;
    }

    let scheme = newScheme.trim();
    if (scheme && !scheme.includes('://')) scheme = `${scheme}://`;

    const app: CustomApp = { id, name, emoji: '📱', scheme: scheme || undefined };
    await addCustomApp(app);
    setCustomApps((prev) => [...prev, app]);
    await setBlocked(new Set(blockedIds).add(id));
    resetAddForm();

    Alert.alert(
      `${name} added`,
      `Now open the iOS Shortcuts app, create an automation for ${name}, and set its "Open URL" action to:\n\nbrainfuel://block?app=${id}`,
    );
  };

  const handleRemoveCustom = async (id: string) => {
    await removeCustomApp(id);
    setCustomApps((prev) => prev.filter((a) => a.id !== id));
    if (blockedIds.has(id)) {
      const updated = new Set(blockedIds);
      updated.delete(id);
      await setBlocked(updated);
    }
  };

  const resetAddForm = () => {
    setShowAdd(false);
    setNewName('');
    setNewScheme('');
  };

  const allEntries: AppEntry[] = [
    ...ALL_APPS,
    ...customApps.map((a) => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji ?? '📱',
      category: 'Custom app',
      isCustom: true,
    })),
  ];

  const filtered = allEntries.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const blocked = filtered.filter((a) => blockedIds.has(a.id));
  const unblocked = filtered.filter((a) => !blockedIds.has(a.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Blocked Apps" subtitle={`${blockedIds.size} app${blockedIds.size !== 1 ? 's' : ''} protected`} />

      {/* Count banner */}
      {blockedIds.size > 0 && (
        <View style={styles.banner}>
          <LinearGradient
            colors={['rgba(0,245,255,0.12)', 'rgba(0,245,255,0.04)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Text style={styles.bannerText}>
            🛡️ {blockedIds.size} app{blockedIds.size !== 1 ? 's' : ''} will require a brain quiz to open
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          placeholderTextColor={colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add any app */}
        {!showAdd ? (
          <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add-circle" size={20} color={colors.brand.cyan} />
            <Text style={styles.addBtnText}>Add any app</Text>
          </Pressable>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add a custom app</Text>
            <TextInput
              style={styles.addInput}
              placeholder="App name (e.g. Duolingo)"
              placeholderTextColor={colors.text.tertiary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={styles.addInput}
              placeholder="URL scheme (optional, e.g. duolingo://)"
              placeholderTextColor={colors.text.tertiary}
              value={newScheme}
              onChangeText={setNewScheme}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.addHint}>
              The URL scheme is optional. It lets Brainfuel reopen the app for you after you pass the quiz.
            </Text>
            <View style={styles.addActions}>
              <Pressable style={[styles.addAction, styles.addCancel]} onPress={resetAddForm}>
                <Text style={styles.addCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addAction, styles.addSave, !newName.trim() && styles.addSaveDisabled]}
                onPress={handleAddApp}
                disabled={!newName.trim()}
              >
                <Text style={styles.addSaveText}>Add app</Text>
              </Pressable>
            </View>
          </View>
        )}

        {blocked.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Protected ✓</Text>
            {blocked.map((app) => (
              <AppBlockRow
                key={app.id}
                appName={app.name}
                emoji={app.emoji}
                category={app.category}
                blocked={true}
                onToggle={(v) => handleToggle(app.id, v)}
                onRemove={app.isCustom ? () => handleRemoveCustom(app.id) : undefined}
              />
            ))}
          </>
        )}

        {unblocked.length > 0 && (
          <>
            <Text style={[styles.groupLabel, blocked.length > 0 && { marginTop: spacing.base }]}>
              Available
            </Text>
            {unblocked.map((app) => (
              <AppBlockRow
                key={app.id}
                appName={app.name}
                emoji={app.emoji}
                category={app.category}
                blocked={false}
                onToggle={(v) => handleToggle(app.id, v)}
                onRemove={app.isCustom ? () => handleRemoveCustom(app.id) : undefined}
              />
            ))}
          </>
        )}

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 You can block any app, even ones not listed here. iOS does not let Brainfuel see which apps you have installed, so tap "Add any app" to add one by name, then point an iOS Shortcut at it. The Shortcuts automation is what actually triggers the quiz.
          </Text>
        </View>

        <Pressable style={styles.realBlockingLink} onPress={() => router.push('/real-blocking')}>
          <Ionicons name="lock-closed" size={16} color={colors.brand.cyan} />
          <Text style={styles.realBlockingText}>Try real iOS blocking (beta)</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  banner: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  bannerText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.brand.cyan,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    margin: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base },
  groupLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  tip: {
    marginTop: spacing.xl,
    padding: spacing.base,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tipText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border.accent,
  },
  addBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.brand.cyan,
  },
  addForm: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.accent,
    padding: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  addFormTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.text.primary,
  },
  addInput: {
    backgroundColor: colors.bg.cardAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
  },
  addHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 17,
  },
  addActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  addAction: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCancel: {
    backgroundColor: colors.bg.cardAlt,
  },
  addCancelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.text.secondary,
  },
  addSave: {
    backgroundColor: colors.brand.cyan,
  },
  addSaveDisabled: {
    opacity: 0.4,
  },
  addSaveText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.text.inverse,
  },
  realBlockingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.accent,
    backgroundColor: colors.bg.card,
  },
  realBlockingText: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.brand.cyan,
  },
});

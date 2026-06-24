import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Animated,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  radius,
  spacing,
  sticker,
  fonts,
  Sticker,
  Button,
  Toggle,
} from '../../src/ui';
import { getSettings, saveSettings } from '../../src/services/storage';
import { GameCategory, QuizCount } from '../../src/games/types';
import { CATEGORY_META } from '../../src/games';
import { CATEGORY_EMOJI, ALL_CATEGORIES } from '../../src/games/categoryMeta';
import {
  isScreenTimeAvailable,
  isScreenTimeAuthorized,
  requestScreenTimeAuthorization,
  applyBlockGroups,
  clearAllBlockGroups,
} from '../../src/services/screenTimeBlocking';
import {
  ensureNotificationPermission,
  sendTestNotification,
  getNotificationStatus,
} from '../../src/services/notifications';
import {
  BlockGroup,
  getBlockGroups,
  upsertBlockGroup,
  newGroupId,
  describeRule,
} from '../../src/services/blockGroups';

const QUESTION_COUNTS: QuizCount[] = [3, 5, 10];

const COUNT_LABELS: Record<QuizCount, { sub: string; time: string }> = {
  3: { sub: 'Quick', time: '~1 min' },
  5: { sub: 'Balanced', time: '~3 min' },
  10: { sub: 'Earn it', time: '~6 min' },
};

function CountOption({
  count,
  selected,
  onPress,
}: {
  count: QuizCount;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const meta = COUNT_LABELS[count];

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.sequence([
            Animated.spring(scale, {
              toValue: 0.95,
              useNativeDriver: true,
              tension: 300,
              friction: 10,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 200,
              friction: 12,
            }),
          ]).start();
          onPress();
        }}
        style={[styles.countBtn, selected && styles.countBtnSelected]}
      >
        <Text style={[styles.countNum, selected && styles.countNumSelected]}>
          {count}
        </Text>
        <Text style={[styles.countLabel, selected && styles.countLabelSelected]}>
          {meta.sub}
        </Text>
        <Text style={styles.countTime}>{meta.time}</Text>
        {selected && (
          <View style={styles.countCheck}>
            <Text style={styles.countCheckText}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function CategoryRow({
  cat,
  selected,
  onPress,
}: {
  cat: GameCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const meta = CATEGORY_META[cat];
  const emoji = CATEGORY_EMOJI[cat];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.catRow, selected && styles.catRowSelected]}
    >
      <Text style={styles.catEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.catName, selected && styles.catNameSelected]}>
          {meta.label}
        </Text>
        <Text style={styles.catDesc} numberOfLines={1}>
          {meta.description}
        </Text>
      </View>
      {selected && (
        <View style={styles.catCheck}>
          <Text style={styles.catCheckText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

function GameConfigSection() {
  const router = useRouter();
  const [category, setCategory] = useState<GameCategory>('random');
  const [questionCount, setQuestionCount] = useState<QuizCount>(3);

  useFocusEffect(
    useCallback(() => {
      getSettings().then((s) => {
        setCategory(s.gameCategory);
        setQuestionCount(s.questionCount);
      });
    }, [])
  );

  const handleCategoryChange = async (cat: GameCategory) => {
    Haptics.selectionAsync();
    setCategory(cat);
    await saveSettings({ gameCategory: cat });
  };

  const handleCountChange = async (n: QuizCount) => {
    setQuestionCount(n);
    await saveSettings({ questionCount: n });
  };

  const selectedEmoji = CATEGORY_EMOJI[category];
  const selectedMeta = CATEGORY_META[category];

  return (
    <View style={styles.sectionGap}>
      <Text style={styles.sectionTitle}>Game to unlock</Text>

      <Sticker bg={colors.paper} radius={radius.xl} style={styles.cardWrapper}>
        <View style={styles.cardInner}>
          {/* Question count */}
          <Text style={styles.fieldLabel}>Questions to answer</Text>
          <Text style={styles.fieldSub}>
            How many correct answers unlock 15 minutes?
          </Text>
          <View style={styles.countRow}>
            {QUESTION_COUNTS.map((n) => (
              <CountOption
                key={n}
                count={n}
                selected={questionCount === n}
                onPress={() => handleCountChange(n)}
              />
            ))}
          </View>

          {/* Category */}
          <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>
            Game category
          </Text>
          <Text style={styles.fieldSub}>
            Which type of brain challenge should appear?
          </Text>
          <View style={styles.catList}>
            {ALL_CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat}
                cat={cat}
                selected={category === cat}
                onPress={() => handleCategoryChange(cat)}
              />
            ))}
          </View>

          {/* Preview CTA */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/quiz',
                params: { app: 'preview', demo: '1' },
              })
            }
            style={styles.previewBtn}
          >
            <View style={styles.previewTextWrap}>
              <Text style={styles.previewTitle}>Preview current game</Text>
              <Text style={styles.previewSub}>
                {questionCount} {selectedEmoji} {selectedMeta.label}{' '}
                question{questionCount > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.previewArrow}>
              <Ionicons name="play" size={16} color={colors.white} />
            </View>
          </Pressable>
        </View>
      </Sticker>
    </View>
  );
}

export default function BlockedAppsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const available = isScreenTimeAvailable();
  const [authorized, setAuthorized] = useState(false);
  const [notifsOn, setNotifsOn] = useState(false);
  const [groups, setGroups] = useState<BlockGroup[]>([]);

  // Reload the groups, refresh the real permission states, and keep enforcement
  // current on every visit.
  useFocusEffect(
    useCallback(() => {
      setAuthorized(isScreenTimeAuthorized());
      getNotificationStatus().then(setNotifsOn);
      getBlockGroups().then((g) => {
        setGroups(g);
        applyBlockGroups(g);
      });
    }, []),
  );

  // Expo Go path: show explanation and still show game config.
  if (!available) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <View>
            <Text style={styles.pageTitle}>Blocked apps</Text>
            <Text style={styles.pageSub}>
              Screen Time not available in Expo Go
            </Text>
          </View>

          <Sticker
            bg={colors.paper}
            radius={radius.xl}
            style={styles.cardWrapper}
          >
            <View style={styles.noticePad}>
              <Text style={styles.noticeEmoji}>🔒</Text>
              <Text style={styles.noticeTitle}>Needs a development build</Text>
              <Text style={styles.noticeBody}>
                Real app blocking uses Apple's Screen Time API, which requires
                native code and cannot run inside Expo Go. Build the app with
                EAS and open it in a dev build to set this up.
              </Text>
              <Text style={styles.noticeBody}>
                Setup steps are in docs/real-blocking-setup.md.
              </Text>
            </View>
          </Sticker>

          <GameConfigSection />
        </ScrollView>
      </View>
    );
  }

  const handleAuthorize = async () => {
    const ok = await requestScreenTimeAuthorization();
    setAuthorized(ok);
    // So the shield's "Unlock with a quiz" button can post a tappable
    // notification (iOS blocks the shield from launching the app directly).
    if (ok) setNotifsOn(await ensureNotificationPermission());
  };

  const toggleGroup = async (group: BlockGroup, enabled: boolean) => {
    Haptics.selectionAsync();
    const updated = await upsertBlockGroup({ ...group, enabled });
    setGroups(updated);
    await applyBlockGroups(updated);
  };

  const handleUnblockAll = async () => {
    await clearAllBlockGroups();
    Alert.alert(
      'Unblocked',
      'All shields lifted. Your groups stay saved, so you can turn them back on anytime.',
    );
  };

  const handleTurnOnNotifs = async () => {
    // Brings up the iOS permission popup when it is still undecided. If it was
    // already denied, iOS will not show the popup again, so send the user to
    // Settings instead.
    const ok = await ensureNotificationPermission();
    setNotifsOn(ok);
    if (ok) {
      await sendTestNotification();
      Alert.alert(
        'Notifications on',
        'You should see a sample notification now. The shield unlock button works the same way.',
      );
    } else {
      Alert.alert(
        'Turn on notifications',
        'Brainfuel needs notification access so the shield unlock button can reach you. Open Settings to turn it on.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Page header */}
        <View>
          <Text style={styles.pageTitle}>Blocked apps</Text>
          <Text style={styles.pageSub}>Group apps and set how each is blocked</Text>
        </View>

        {/* Step 1: permission */}
        <Text style={styles.sectionTitle}>1. Grant Screen Time access</Text>
        <Sticker bg={colors.paper} radius={radius.xl} style={styles.cardWrapper}>
          <View style={styles.cardInner}>
            <Text style={styles.help}>
              iOS will ask permission for Brainfuel to manage app restrictions.
            </Text>
            <Button
              variant={authorized ? 'teal' : 'coral'}
              label={authorized ? '✓ Permission granted' : 'Grant permission'}
              onPress={handleAuthorize}
              block
              style={{ marginTop: spacing.md }}
            />
            {authorized && (
              <Button
                variant={notifsOn ? 'teal' : 'paper'}
                label={notifsOn ? '✓ Notifications on' : 'Turn on notifications'}
                iconName="notifications-outline"
                onPress={handleTurnOnNotifs}
                block
                style={{ marginTop: spacing.sm }}
              />
            )}
          </View>
        </Sticker>

        {/* Step 2: block groups (locked until Screen Time access is granted) */}
        <Text style={styles.sectionTitle}>2. Your block groups</Text>
        {!authorized ? (
          <Sticker bg={colors.paper} radius={radius.xl} style={styles.cardWrapper}>
            <View style={styles.cardInner}>
              <Text style={styles.help}>
                Grant Screen Time access above first. Then you can add groups,
                pick their apps, and choose how each one blocks.
              </Text>
            </View>
          </Sticker>
        ) : (
          <>
            {groups.length === 0 ? (
              <Sticker bg={colors.paper} radius={radius.xl} style={styles.cardWrapper}>
                <View style={styles.cardInner}>
                  <Text style={styles.help}>
                    No groups yet. Add one, pick its apps, and choose how it blocks:
                    always, a daily limit, or a schedule. Put one app per group for
                    per-app control.
                  </Text>
                </View>
              </Sticker>
            ) : (
              <View style={styles.groupList}>
                {groups.map((g) => (
                  <Pressable key={g.id} onPress={() => router.push(`/block-group?id=${g.id}` as any)}>
                    <Sticker
                      bg={colors.paper}
                      radius={radius.lg}
                      offset={sticker.shadow.sm}
                      innerStyle={styles.groupRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupName}>{g.name}</Text>
                        <Text style={styles.groupMeta}>
                          {g.appCount} app{g.appCount === 1 ? '' : 's'} · {describeRule(g.rule)}
                        </Text>
                      </View>
                      <Toggle value={g.enabled} onChange={(v) => toggleGroup(g, v)} />
                    </Sticker>
                  </Pressable>
                ))}
              </View>
            )}
            <Button
              variant="purple"
              label="Add group"
              iconName="add"
              block
              onPress={() => router.push(`/block-group?id=${newGroupId()}` as any)}
              style={styles.cardWrapper}
            />

            {/* Panic switch */}
            <Button
              variant="paper"
              label="Unblock everything"
              iconName="shield-outline"
              block
              onPress={handleUnblockAll}
            />

            {/* Info tip */}
            <View style={styles.tip}>
              <Ionicons name="information-circle" size={18} color={colors.purple} />
              <Text style={styles.tipText}>
                When a group blocks an app, opening it shows the Brainfuel shield.
                Pass a quiz to unlock 15 minutes.
              </Text>
            </View>
          </>
        )}

        {/* Game config */}
        <GameConfigSection />
      </ScrollView>
    </View>
  );
}

// Styles

const SHADOW_OFFSET = sticker.shadow.md;

const styles = StyleSheet.create({
  // layout
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: spacing.lg },

  // page header
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.ink,
  },
  pageSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 4,
  },

  // section label above each card
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.ink,
    marginBottom: -spacing.xs,
  },

  // wrapper for every sticker card (adds bottom margin for shadow space)
  cardWrapper: { marginBottom: SHADOW_OFFSET },

  // inner padding for paper cards
  cardInner: { padding: 18 },

  // help text inside cards
  help: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.75,
    lineHeight: 20,
  },

  // block group rows
  groupList: { gap: spacing.sm },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupName: { fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
  groupMeta: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12.5,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },

  // tip row
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    padding: 14,
    marginBottom: SHADOW_OFFSET,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    lineHeight: 18,
  },

  // game config
  sectionGap: { gap: spacing.sm },
  fieldLabel: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 2,
  },
  fieldSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    marginBottom: spacing.md,
    lineHeight: 18,
  },

  // count buttons
  countRow: { flexDirection: 'row', gap: spacing.sm },
  countBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    backgroundColor: colors.bg2,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 96,
    justifyContent: 'center',
    position: 'relative',
  },
  countBtnSelected: { backgroundColor: colors.yellow },
  countNum: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.ink,
    lineHeight: 38,
  },
  countNumSelected: { color: colors.ink },
  countLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
  countLabelSelected: { color: colors.ink },
  countTime: {
    fontFamily: fonts.bodyRegular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  countCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCheckText: {
    fontSize: 11,
    color: colors.white,
    fontFamily: fonts.heading,
  },

  // category list rows
  catList: { gap: spacing.xs },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.md,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    backgroundColor: colors.bg2,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  catRowSelected: { backgroundColor: colors.yellow },
  catEmoji: { fontSize: 24 },
  catName: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.ink,
  },
  catNameSelected: { color: colors.ink },
  catDesc: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  catCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCheckText: {
    fontSize: 12,
    color: colors.white,
    fontFamily: fonts.heading,
  },

  // preview CTA inside game config
  previewBtn: {
    marginTop: spacing.xl,
    borderRadius: radius.md,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    backgroundColor: colors.coral,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewTextWrap: {
    flex: 1,
    gap: 3,
  },
  previewTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
  },
  previewSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.white,
    opacity: 0.85,
  },
  previewArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // notice (Expo Go path)
  noticePad: { padding: 22, alignItems: 'center' },
  noticeEmoji: { fontSize: 44, marginBottom: spacing.md },
  noticeTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noticeBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

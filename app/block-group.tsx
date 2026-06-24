/**
 * Block group editor. Create or edit one named group: pick its apps, then set a
 * single rule (always block, daily limit, or schedule). iOS hides which apps
 * were picked, so the user names the group themselves.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius as R, spacing, sticker, fonts, Sticker, Button, Chip } from '../src/ui';
import {
  BlockGroup,
  BlockRule,
  getBlockGroups,
  upsertBlockGroup,
  removeBlockGroup,
  formatTime,
} from '../src/services/blockGroups';
import { applyBlockGroups } from '../src/services/screenTimeBlocking';
import { ensureNotificationPermission } from '../src/services/notifications';

let DeviceActivity: any = null;
try {
  DeviceActivity = require('react-native-device-activity');
} catch {
  DeviceActivity = null;
}

type RuleType = BlockRule['type'];

const LIMIT_PRESETS = [15, 30, 45, 60, 90, 120];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HALF_HOUR = 30;

export default function BlockGroupEditor() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = id ?? '';

  const [existing, setExisting] = useState(false);
  const [name, setName] = useState('');
  const [appCount, setAppCount] = useState(0);
  const [ruleType, setRuleType] = useState<RuleType>('always');
  const [limitMinutes, setLimitMinutes] = useState(30);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startMinutes, setStartMinutes] = useState(9 * 60);
  const [endMinutes, setEndMinutes] = useState(17 * 60);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getBlockGroups().then((groups) => {
        const g = groups.find((x) => x.id === groupId);
        if (!g) return;
        setExisting(true);
        setName(g.name);
        setAppCount(g.appCount);
        setRuleType(g.rule.type);
        if (g.rule.type === 'limit') setLimitMinutes(g.rule.minutes);
        if (g.rule.type === 'schedule') {
          setDays(g.rule.days);
          setStartMinutes(g.rule.startMinutes);
          setEndMinutes(g.rule.endMinutes);
        }
      });
    }, [groupId]),
  );

  const SelectionView = DeviceActivity?.DeviceActivitySelectionViewPersisted;

  const buildRule = (): BlockRule => {
    if (ruleType === 'limit') return { type: 'limit', minutes: limitMinutes };
    if (ruleType === 'schedule')
      return { type: 'schedule', days, startMinutes, endMinutes };
    return { type: 'always' };
  };

  const canSave =
    name.trim().length > 0 &&
    appCount > 0 &&
    (ruleType !== 'schedule' || days.length > 0) &&
    (ruleType !== 'limit' || limitMinutes >= 1);

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Almost there', 'Name the group, pick at least one app, and set its rule.');
      return;
    }
    const group: BlockGroup = {
      id: groupId,
      name: name.trim(),
      appCount,
      rule: buildRule(),
      enabled: true,
    };
    try {
      await upsertBlockGroup(group);
    } catch {
      // storage rarely fails; fall through so the user is not stuck
    }
    // Make sure notifications are allowed so the shield's "Unlock with a quiz"
    // button can post its tappable notification.
    ensureNotificationPermission().catch(() => {});
    // Apply enforcement in the background so a native hiccup can never block the
    // save or the navigation. The Blocked tab and app launch re-apply it too.
    applyBlockGroups().catch(() => {});
    Alert.alert('Saved', `"${group.name}" is set.`, [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete group', `Remove "${name || 'this group'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const groups = await removeBlockGroup(groupId);
          await applyBlockGroups(groups);
          router.back();
        },
      },
    ]);
  };

  const stepStart = (delta: number) =>
    setStartMinutes((m) => (m + delta + 1440) % 1440);
  const stepEnd = (delta: number) => setEndMinutes((m) => (m + delta + 1440) % 1440);
  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Chip onPress={() => router.back()}>
          <Ionicons name="close" size={16} color={colors.ink} />
        </Chip>
        <Text style={styles.headerTitle}>{existing ? 'Edit group' : 'New group'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Name */}
        <Text style={styles.label}>Group name</Text>
        <Sticker bg={colors.paper} radius={R.lg} innerStyle={styles.fieldInner}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Social, Games, Instagram"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={24}
          />
        </Sticker>

        {/* Apps */}
        <Text style={styles.label}>Apps</Text>
        <Sticker bg={colors.paper} radius={R.lg} innerStyle={styles.cardInner}>
          <Text style={styles.help}>
            Pick the apps for this group. iOS keeps the selection private, so name
            the group above to remember it.
          </Text>
          <Button
            variant="purple"
            label={appCount > 0 ? `${appCount} app${appCount === 1 ? '' : 's'} chosen` : 'Choose apps'}
            iconName="apps"
            block
            onPress={() => setShowPicker(true)}
            style={{ marginTop: spacing.md }}
          />
        </Sticker>

        {/* Rule type */}
        <Text style={styles.label}>How should it block?</Text>
        <View style={styles.ruleRow}>
          <RuleCard
            active={ruleType === 'always'}
            emoji="🚫"
            title="Always"
            onPress={() => setRuleType('always')}
          />
          <RuleCard
            active={ruleType === 'limit'}
            emoji="⏱️"
            title="Daily limit"
            onPress={() => setRuleType('limit')}
          />
          <RuleCard
            active={ruleType === 'schedule'}
            emoji="📅"
            title="Schedule"
            onPress={() => setRuleType('schedule')}
          />
        </View>

        {/* Rule detail */}
        {ruleType === 'always' && (
          <Sticker bg={colors.bg2} radius={R.lg} offset={sticker.shadow.sm} innerStyle={styles.cardInner}>
            <Text style={styles.help}>
              These apps stay shielded. Pass a quiz to unlock 15 minutes at a time.
            </Text>
          </Sticker>
        )}

        {ruleType === 'limit' && (
          <Sticker bg={colors.paper} radius={R.lg} innerStyle={styles.cardInner}>
            <Text style={styles.help}>Allow this much use per day, then shield.</Text>
            <View style={styles.presetWrap}>
              {LIMIT_PRESETS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setLimitMinutes(m)}
                  style={[styles.preset, limitMinutes === m && styles.presetOn]}
                >
                  <Text style={[styles.presetText, limitMinutes === m && styles.presetTextOn]}>
                    {m}m
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.customRow}>
              <Text style={styles.customLabel}>Custom</Text>
              <View style={styles.customInputWrap}>
                <TextInput
                  value={limitMinutes > 0 ? String(limitMinutes) : ''}
                  onChangeText={(t) => {
                    const digits = t.replace(/[^0-9]/g, '');
                    setLimitMinutes(digits === '' ? 0 : Math.min(1440, parseInt(digits, 10)));
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  style={styles.customInput}
                  maxLength={4}
                />
                <Text style={styles.customUnit}>min</Text>
              </View>
            </View>
          </Sticker>
        )}

        {ruleType === 'schedule' && (
          <Sticker bg={colors.paper} radius={R.lg} innerStyle={styles.cardInner}>
            <Text style={styles.help}>Block on these days, during this window.</Text>
            <View style={styles.dayRow}>
              {DAY_LETTERS.map((letter, d) => (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(d)}
                  style={[styles.day, days.includes(d) && styles.dayOn]}
                >
                  <Text style={[styles.dayText, days.includes(d) && styles.dayTextOn]}>
                    {letter}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TimeStepper label="Start" minutes={startMinutes} onStep={stepStart} />
            <TimeStepper label="End" minutes={endMinutes} onStep={stepEnd} />
          </Sticker>
        )}

        {/* Save / delete */}
        <Button
          variant="coral"
          lg
          block
          label="Save group"
          onPress={handleSave}
          style={[{ marginTop: spacing.lg }, !canSave && styles.disabled]}
        />
        {existing && (
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete group</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* App picker (full screen, kept out of the ScrollView so taps register) */}
      <Modal visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={[styles.pickerModal, { paddingTop: insets.top }]}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose apps</Text>
            <Pressable onPress={() => setShowPicker(false)} hitSlop={8}>
              <Text style={styles.pickerDone}>Done</Text>
            </Pressable>
          </View>
          {SelectionView ? (
            <SelectionView
              style={{ flex: 1 }}
              familyActivitySelectionId={groupId}
              onSelectionChange={(e: any) => {
                const meta = e?.nativeEvent ?? {};
                setAppCount((meta.applicationCount ?? 0) + (meta.categoryCount ?? 0));
              }}
            />
          ) : (
            <Text style={styles.help}>The app picker needs a development build.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

function RuleCard({
  active,
  emoji,
  title,
  onPress,
}: {
  active: boolean;
  emoji: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Sticker
        bg={active ? colors.yellow : colors.paper}
        radius={R.md}
        offset={sticker.shadow.sm}
        innerStyle={styles.ruleCard}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text style={styles.ruleTitle}>{title}</Text>
      </Sticker>
    </Pressable>
  );
}

function TimeStepper({
  label,
  minutes,
  onStep,
}: {
  label: string;
  minutes: number;
  onStep: (delta: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => onStep(-HALF_HOUR)} style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color={colors.ink} />
        </Pressable>
        <Text style={styles.stepperTime}>{formatTime(minutes)}</Text>
        <Pressable onPress={() => onStep(HALF_HOUR)} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: 18, gap: spacing.sm },

  label: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  fieldInner: { padding: 4 },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardInner: { padding: 16 },
  help: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    lineHeight: 19,
  },

  ruleRow: { flexDirection: 'row', gap: spacing.sm },
  ruleCard: { paddingVertical: 14, alignItems: 'center', gap: 6 },
  ruleTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },

  presetWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.bg2,
  },
  presetOn: { backgroundColor: colors.yellow },
  presetText: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  presetTextOn: { color: colors.ink },

  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  customLabel: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: R.md,
    backgroundColor: colors.bg2,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  customInput: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.ink,
    minWidth: 44,
    textAlign: 'right',
    padding: 0,
  },
  customUnit: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, opacity: 0.7 },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.purple },
  dayText: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  dayTextOn: { color: colors.white },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stepperLabel: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: colors.ink,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTime: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.ink,
    minWidth: 78,
    textAlign: 'center',
  },

  disabled: { opacity: 0.45 },
  deleteBtn: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.sm },
  deleteText: { fontFamily: fonts.heading, fontSize: 15, color: colors.coral },

  pickerModal: { flex: 1, backgroundColor: colors.bg },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: spacing.md,
    borderBottomWidth: sticker.borderWidth,
    borderBottomColor: colors.ink,
  },
  pickerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.ink },
  pickerDone: { fontFamily: fonts.heading, fontSize: 16, color: colors.purple },
});

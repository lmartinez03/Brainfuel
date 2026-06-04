import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, radius, shadow } from '../src/theme';
import { startPurchase, restorePurchases, PRODUCT_IDS } from '../src/services/subscription';

const FEATURES = [
  { icon: '🧠', text: 'Unlimited brain quizzes across all categories' },
  { icon: '🛡️', text: 'Block unlimited apps with one-tap Shortcuts setup' },
  { icon: '📊', text: 'Detailed stats, streaks & progress tracking' },
  { icon: '🎲', text: 'Custom question packs (coming soon)' },
  { icon: '🔔', text: 'Daily brain challenge reminders' },
  { icon: '☁️', text: 'iCloud sync across your devices' },
];

const REVIEWS = [
  { name: 'Alex M.', rating: 5, text: 'Completely changed how I use my phone. I actually think before opening TikTok now!', avatar: '🧑‍💻' },
  { name: 'Sarah K.', rating: 5, text: 'Love that it makes me do mental math. My screen time is down 40%.', avatar: '👩‍🎤' },
  { name: 'Jordan P.', rating: 5, text: 'The riddles category is genuinely fun. I look forward to the quiz now.', avatar: '🧑‍🎨' },
];

type Plan = 'monthly' | 'annual';

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const productId = selectedPlan === 'annual' ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly;
    const result = await startPurchase(productId);
    setLoading(false);
    if (result.success) {
      router.back();
    }
    // Show error in real impl
  };

  const handleRestore = async () => {
    setLoading(true);
    await restorePurchases();
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0D0F1A', '#0D1230', '#0D0F1A']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />

      {/* Close */}
      <Pressable onPress={() => router.back()} style={[styles.closeBtn, { top: insets.top + 12 }]}>
        <Ionicons name="close" size={20} color={colors.text.secondary} />
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⚡</Text>
          <Text style={styles.heroTitle}>Brainfuel Pro</Text>
          <View style={styles.trialBadge}>
            <LinearGradient colors={colors.gradient.orange} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.trialBadgeText}>3-Day Free Trial</Text>
          </View>
          <Text style={styles.heroSub}>
            Upgrade to unlock the full power of Brainfuel. Your brain will thank you.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <LinearGradient
            colors={['#1C2035', '#151829']}
            style={StyleSheet.absoluteFillObject}
          />
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.brand.green} />
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansRow}>
          {/* Annual */}
          <Pressable
            style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan('annual'); }}
          >
            {selectedPlan === 'annual' && (
              <LinearGradient
                colors={['rgba(0,245,255,0.12)', 'rgba(0,245,255,0.04)']}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={styles.bestValueBadge}>
              <LinearGradient colors={colors.gradient.orange} style={StyleSheet.absoluteFillObject} />
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planPrice}>$29.99</Text>
            <Text style={styles.planPer}>/year</Text>
            <Text style={styles.planSave}>Save 58%</Text>
            <Text style={styles.planMonthly}>~$2.50/mo</Text>
          </Pressable>

          {/* Monthly */}
          <Pressable
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan('monthly'); }}
          >
            {selectedPlan === 'monthly' && (
              <LinearGradient
                colors={['rgba(0,245,255,0.12)', 'rgba(0,245,255,0.04)']}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={[styles.bestValueBadge, { opacity: 0 }]} />
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planPrice}>$5.99</Text>
            <Text style={styles.planPer}>/month</Text>
            <Text style={[styles.planSave, { color: 'transparent' }]}>-</Text>
            <Text style={styles.planMonthly}>Flexible</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <PrimaryButton
            label={`Start Free Trial → ${selectedPlan === 'annual' ? '$29.99/yr' : '$5.99/mo'}`}
            onPress={handleSubscribe}
            variant="cyan"
            size="lg"
            loading={loading}
          />
          <Text style={styles.ctaNote}>
            3 days free, then {selectedPlan === 'annual' ? '$29.99/year' : '$5.99/month'}.{'\n'}
            Cancel anytime from iOS Settings.
          </Text>
        </View>

        {/* Reviews */}
        <Text style={styles.reviewsTitle}>What People Say</Text>
        {REVIEWS.map((r, i) => (
          <View key={i} style={styles.reviewCard}>
            <LinearGradient
              colors={['#1C2035', '#151829']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAvatar}>{r.avatar}</Text>
              <View>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>"{r.text}"</Text>
          </View>
        ))}

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <Text style={styles.legal}>
          Payment charged to Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renewal is turned off at least 24 hours before the current period ends.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  closeBtn: {
    position: 'absolute',
    right: spacing.base,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: 60 },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.base,
  },
  heroEmoji: { fontSize: 64, marginBottom: spacing.sm },
  heroTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 38,
    color: colors.text.primary,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  trialBadge: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: spacing.md,
    ...shadow.orange,
  },
  trialBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    gap: spacing.md,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  featureIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  featureText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  plansRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.card,
    ...shadow.md,
    minHeight: 160,
  },
  planCardSelected: {
    borderColor: colors.brand.cyan,
    ...shadow.cyan,
  },
  bestValueBadge: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.sm,
    height: 22,
    justifyContent: 'center',
  },
  bestValueText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.8,
  },
  planName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  planPrice: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  planPer: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.text.secondary,
  },
  planSave: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.brand.green,
    marginTop: 4,
  },
  planMonthly: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: colors.text.tertiary,
  },
  ctaSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  ctaNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  reviewCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewAvatar: { fontSize: 28 },
  reviewName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.text.primary,
  },
  reviewStars: {
    fontSize: 13,
    color: colors.brand.yellow,
  },
  reviewText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    marginTop: spacing.sm,
  },
  restoreText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  legal: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.md,
  },
});

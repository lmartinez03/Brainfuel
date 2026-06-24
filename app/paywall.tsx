import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  BackHandler,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  colors,
  radius as R,
  sticker,
  fonts,
  spacing,
  Sticker,
  Button,
  Chip,
  Mascot,
} from '../src/ui';
import {
  startPurchase,
  restorePurchases,
  hasActiveSubscription,
  PRODUCT_IDS,
  PRICING,
} from '../src/services/subscription';
import { LEGAL_URLS } from '../src/config/legal';

const FEATURES = [
  { icon: '🧠', text: 'Unlimited brain quizzes across all categories' },
  { icon: '🛡️', text: 'Block unlimited apps with Apple Screen Time' },
  { icon: '📊', text: 'Detailed stats and progress tracking' },
  { icon: '🎲', text: 'Custom question packs (coming soon)' },
  { icon: '🔔', text: 'Daily brain challenge reminders' },
  { icon: '🧘', text: 'Build focus and beat the doomscroll' },
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
  // null while loading. false means the paywall is acting as a mandatory gate
  // (no close, hardware back blocked); true means an already-subscribed user
  // opened it from Settings, so they can dismiss it.
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    hasActiveSubscription().then(setSubscribed);
  }, []);

  // While the paywall is a gate, swallow the Android hardware back button so the
  // user cannot escape into the app without subscribing.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => subscribed !== true);
    return () => sub.remove();
  }, [subscribed]);

  // Enter the app, replacing the paywall so it cannot be navigated back to.
  const enterApp = () => router.replace('/(tabs)');

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const productId = selectedPlan === 'annual' ? PRODUCT_IDS.annual : PRODUCT_IDS.monthly;
    const result = await startPurchase(productId);
    setLoading(false);
    if (result.success) enterApp();
    // A real build surfaces result.error here on failure.
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await restorePurchases();
    setLoading(false);
    if (result.success) enterApp();
  };

  const isAnnual = selectedPlan === 'annual';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Close button: only for already-subscribed users (e.g. opened from
          Settings). When the paywall is a mandatory gate it stays hidden. */}
      {subscribed === true && (
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Mascot size={110} expr="excited" />
          <Text style={styles.heroTitle}>Brainfuel Pro</Text>
          <View style={styles.trialChipWrap}>
            <Chip bg={colors.yellow}>
              <Text style={styles.trialChipText}>
                {isAnnual ? `${PRICING.annual.trialDays}-day free trial` : 'Cancel anytime'}
              </Text>
            </Chip>
          </View>
          <Text style={styles.heroSub}>
            Brainfuel is a subscription. Start with the annual plan and your first{' '}
            {PRICING.annual.trialDays} days are free.
          </Text>
        </View>

        {/* Features card */}
        <Sticker bg={colors.paper} radius={R.xl} offset={sticker.shadow.md} innerStyle={styles.featuresInner}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[
                styles.featureRow,
                i < FEATURES.length - 1 && styles.featureDivider,
              ]}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
            </View>
          ))}
        </Sticker>

        {/* Plan cards */}
        <View style={styles.plansRow}>
          {/* Annual */}
          <Pressable
            style={styles.planWrap}
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan('annual'); }}
          >
            <Sticker
              bg={selectedPlan === 'annual' ? colors.coral : colors.paper}
              radius={R.xl}
              offset={sticker.shadow.md}
              innerStyle={styles.planInner}
            >
              {/* BEST VALUE chip */}
              <Chip bg={colors.yellow}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </Chip>
              <Text style={[styles.planName, selectedPlan === 'annual' && { color: colors.white }]}>
                Annual
              </Text>
              <Text style={[styles.planPrice, selectedPlan === 'annual' && { color: colors.white }]}>
                {PRICING.annual.price}
              </Text>
              <Text style={[styles.planPer, selectedPlan === 'annual' && { color: colors.white, opacity: 0.85 }]}>
                /{PRICING.annual.period}
              </Text>
              <Text style={[styles.planSave, selectedPlan === 'annual' && { color: colors.yellow }]}>
                Save {PRICING.annual.savingsPercent}%
              </Text>
              <Text style={[styles.planMonthly, selectedPlan === 'annual' && { color: colors.white, opacity: 0.75 }]}>
                {PRICING.annual.perMonth}/mo · {PRICING.annual.trialDays} days free
              </Text>
            </Sticker>
          </Pressable>

          {/* Monthly */}
          <Pressable
            style={styles.planWrap}
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan('monthly'); }}
          >
            <Sticker
              bg={selectedPlan === 'monthly' ? colors.coral : colors.paper}
              radius={R.xl}
              offset={sticker.shadow.md}
              innerStyle={styles.planInner}
            >
              {/* Spacer to align with Annual's chip */}
              <View style={styles.planChipSpacer} />
              <Text style={[styles.planName, selectedPlan === 'monthly' && { color: colors.white }]}>
                Monthly
              </Text>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && { color: colors.white }]}>
                {PRICING.monthly.price}
              </Text>
              <Text style={[styles.planPer, selectedPlan === 'monthly' && { color: colors.white, opacity: 0.85 }]}>
                /{PRICING.monthly.period}
              </Text>
              <View style={styles.planSaveSpace} />
              <Text style={[styles.planMonthly, selectedPlan === 'monthly' && { color: colors.white, opacity: 0.75 }]}>
                No free trial
              </Text>
            </Sticker>
          </Pressable>
        </View>

        {/* Savings emphasis: pushes the annual plan */}
        <Sticker bg={colors.teal} radius={R.lg} offset={sticker.shadow.sm} innerStyle={styles.saveBanner}>
          <Text style={styles.saveBannerText}>
            🎉 Annual is just {PRICING.annual.perMonth}/mo, {PRICING.annual.savingsPercent}% cheaper than monthly, plus {PRICING.annual.trialDays} days free.
          </Text>
        </Sticker>

        {/* CTA */}
        <Button
          variant="coral"
          lg
          block
          label={
            loading
              ? 'Processing...'
              : isAnnual
              ? `Start ${PRICING.annual.trialDays}-day free trial`
              : `Subscribe ${PRICING.monthly.price}/mo`
          }
          onPress={loading ? undefined : handleSubscribe}
        />
        <Text style={styles.ctaNote}>
          {isAnnual
            ? `${PRICING.annual.trialDays} days free, then ${PRICING.annual.price}/${PRICING.annual.period}.`
            : `${PRICING.monthly.price}/${PRICING.monthly.period}, billed now.`}
          {'\n'}Cancel anytime from iOS Settings.
        </Text>

        {/* Reviews */}
        <Text style={styles.reviewsTitle}>What People Say</Text>
        <View style={styles.reviewsStack}>
          {REVIEWS.map((r, i) => (
            <Sticker
              key={i}
              bg={colors.paper}
              radius={R.lg}
              offset={sticker.shadow.sm}
              innerStyle={styles.reviewInner}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAvatar}>{r.avatar}</Text>
                <View>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>"{r.text}"</Text>
            </Sticker>
          ))}
        </View>

        {/* Restore and legal */}
        <Pressable onPress={loading ? undefined : handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>

        <Text style={styles.legal}>
          Payment charged to Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renewal is turned off at least 24 hours before the current period ends.
        </Text>

        <View style={styles.legalLinks}>
          <Text style={styles.legalLink} onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
            Terms of Service
          </Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalLink} onPress={() => Linking.openURL(LEGAL_URLS.privacy)}>
            Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: R.md,
    backgroundColor: colors.paper,
    borderWidth: 2.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    // Hard offset shadow to match the sticker style
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  content: {
    paddingHorizontal: 18,
    gap: spacing.lg,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 40,
    color: colors.ink,
    marginTop: 4,
  },
  trialChipWrap: {
    alignItems: 'center',
  },
  trialChipText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.ink,
  },
  heroSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  // Features card
  featuresInner: {
    paddingVertical: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  featureDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink + '18',
  },
  featureIcon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },

  // Plan cards
  plansRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planWrap: {
    flex: 1,
  },
  planInner: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
    minHeight: 170,
  },
  planChipSpacer: {
    height: 30,
  },
  planSaveSpace: {
    height: 18,
  },
  planName: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 6,
  },
  planPrice: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.ink,
  },
  planPer: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: -2,
  },
  planSave: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.teal,
    marginTop: 4,
  },
  planMonthly: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.5,
  },
  bestValueText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.ink,
    letterSpacing: 0.5,
  },

  // Savings banner
  saveBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveBannerText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
  },

  // CTA note
  ctaNote: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.55,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -4,
  },

  // Reviews
  reviewsTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.ink,
  },
  reviewsStack: {
    gap: 10,
    marginTop: -4,
  },
  reviewInner: {
    padding: 14,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    fontSize: 28,
  },
  reviewName: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  reviewStars: {
    fontSize: 13,
    color: colors.coral,
    marginTop: 1,
  },
  reviewText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    lineHeight: 21,
    fontStyle: 'italic',
  },

  // Restore + legal
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  restoreText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
  legal: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.45,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: -4,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingBottom: 8,
  },
  legalLink: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.4,
  },
});

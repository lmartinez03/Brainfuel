import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, fonts, Mascot } from '../src/ui';
import { hasActiveSubscription } from '../src/services/subscription';
import { SUBSCRIPTION_ENABLED } from '../src/config/featureFlags';

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const onboarded = await AsyncStorage.getItem('brainfuel_onboarded');
      if (!onboarded) {
        router.replace('/onboarding');
        return;
      }
      // When the paywall is off (launch state) the app is free, so everyone goes
      // straight in. When on, an active subscription is required or the paywall
      // stands in for the app until they subscribe (or restore a purchase).
      if (SUBSCRIPTION_ENABLED) {
        const subscribed = await hasActiveSubscription();
        router.replace(subscribed ? '/(tabs)' : '/paywall');
      } else {
        router.replace('/(tabs)');
      }
    };
    // Small delay so fonts load
    const t = setTimeout(check, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.screen}>
      <Mascot size={110} expr="happy" />
      <Text style={styles.brand}>Brainfuel</Text>
      <ActivityIndicator color={colors.ink} size="small" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 14,
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.ink,
  },
  spinner: {
    marginTop: 4,
  },
});

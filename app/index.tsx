import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme';

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const onboarded = await AsyncStorage.getItem('brainfuel_onboarded');
      if (onboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    };
    // Small delay so fonts load
    const t = setTimeout(check, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.primary }}>
      <ActivityIndicator color={colors.brand.cyan} size="large" />
    </View>
  );
}

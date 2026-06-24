import { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  isBlockingActive,
  isQuizVisible,
  isScreenTimeAuthorized,
  refreshShieldConfig,
  applyBlockGroups,
} from '../src/services/screenTimeBlocking';
import {
  ensureNotificationPermission,
  addNotificationTapListener,
} from '../src/services/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const rootNavState = useRootNavigationState();

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Push the latest shield button config on launch, so config changes apply
  // after a reload without the user having to re-block. If a block is already
  // active, make sure notification permission is in place so the shield's
  // unlock notification can show.
  useEffect(() => {
    refreshShieldConfig();
    applyBlockGroups();
    // If Screen Time is set up, make sure notifications are allowed so the
    // shield's unlock button can post its notification.
    if (isScreenTimeAuthorized()) ensureNotificationPermission();
  }, []);

  // The quiz opens ONLY when the user taps the shield's "unlock with a quiz"
  // notification (or the in-app play button, which navigates on its own).
  // Opening Brainfuel normally never forces a quiz. We still guard on an active
  // block and the quiz not already showing so a stray tap cannot double-open it.
  useEffect(() => {
    // Wait until the navigator is mounted before navigating, otherwise
    // expo-router throws "attempted to navigate before mounting the Root Layout".
    if (!rootNavState?.key) return;
    return addNotificationTapListener(() => {
      if (isBlockingActive() && !isQuizVisible()) {
        router.push({ pathname: '/quiz', params: { app: 'blocked', mode: 'screentime' } });
      }
    });
  }, [rootNavState?.key]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffbf57' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="quiz" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="block-group" options={{ animation: 'slide_from_bottom' }} />
          {/* The paywall doubles as a mandatory gate, so it cannot be swiped
              away. The close button only appears once the user is subscribed. */}
          <Stack.Screen name="paywall" options={{ presentation: 'modal', gestureEnabled: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

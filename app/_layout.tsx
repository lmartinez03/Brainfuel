import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { handleIncomingBlock, unlockApp } from '../src/services/blocking';
import { pruneExpiredUnlockWindows } from '../src/services/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Clean up stale (expired) 15-min unlock windows once on launch.
  useEffect(() => {
    pruneExpiredUnlockWindows();
  }, []);

  // Handle deep links (brainfuel://block?app=instagram)
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const result = await handleIncomingBlock(event.url);
      if (!result) return;

      if (result.alreadyUnlocked) {
        // App is already in its 15-min unlock window. Bounce back immediately.
        await unlockApp(result.appId);
      } else {
        // Need to show the quiz
        router.push({
          pathname: '/quiz',
          params: { app: result.appId },
        });
      }
    };

    // Handle initial URL if app was launched via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0D0F1A' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="quiz" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="shortcuts" />
          <Stack.Screen name="real-blocking" />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

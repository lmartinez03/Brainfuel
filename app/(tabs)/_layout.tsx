// app/(tabs)/_layout.tsx
// Custom tab bar wired to the Brainfuel design system TabBar.
import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from '../../src/ui';
import type { TabId } from '../../src/ui';

const ROUTE_TO_TAB: Record<string, TabId> = {
  index: 'home',
  blocked: 'blocked',
  stats: 'stats',
  settings: 'you',
};

const TAB_TO_ROUTE: Record<TabId, string> = {
  home: '/',
  blocked: '/blocked',
  stats: '/stats',
  you: '/settings',
};

function BrainfuelTabBar() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // segments[1] is the tab name inside (tabs), e.g. 'index', 'blocked', etc.
  const activeSegment = (segments[1] as string) ?? 'index';
  const activeTab: TabId = ROUTE_TO_TAB[activeSegment] ?? 'home';

  function handleTab(t: TabId) {
    router.push(TAB_TO_ROUTE[t] as any);
  }

  function handlePlay() {
    router.push('/quiz' as any);
  }

  return (
    <TabBar
      active={activeTab}
      onTab={handleTab}
      onPlay={handlePlay}
      bottomInset={insets.bottom}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => <BrainfuelTabBar />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="blocked" options={{ title: 'Blocked' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="settings" options={{ title: 'You' }} />
    </Tabs>
  );
}

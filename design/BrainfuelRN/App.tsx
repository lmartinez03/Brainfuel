// App.tsx
// Root: holds app state, simple state-driven navigation, and overlays.
// (No navigation library used — matches the allowed dependency list.)
import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './theme';
import { APPS, INITIAL_STATE, AppState, ShopItem } from './data';

import TabBar, { TabId } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import BlockedScreen from './screens/BlockedScreen';
import StatsScreen from './screens/StatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShopScreen from './screens/ShopScreen';
import StreaksScreen from './screens/StreaksScreen';
import GameScreen from './screens/GameScreen';
import LockScreen from './screens/LockScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND = 'Brainfuel';
const REWARD = 15;

type Overlay = null | 'shop' | 'streaks' | 'game' | 'lock';

function Root() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [tab, setTab] = useState<TabId>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [lockAppId, setLockAppId] = useState<string | null>(null);

  const lockApp = APPS.find((a) => a.id === lockAppId) || null;

  function openApp(id: string) {
    setLockAppId(id);
    setOverlay('lock');
  }

  function onWin(earned: number, correct: number) {
    setState((s) => ({
      ...s,
      minutes: s.minutes + earned,
      xp: s.xp + correct * 20 + (earned > 0 ? 30 : 0),
      doubleBoost: false,
    }));
    setOverlay(null);
    setLockAppId(null);
  }

  function buy(item: ShopItem) {
    setState((s) => {
      const owned = !!s.owned[item.id] && !item.repeat;
      if (owned || s.minutes < item.price) return s;
      let minutes = item.price ? Math.max(0, s.minutes - item.price) : s.minutes;
      if (item.action === 'time' && item.amount) minutes += item.amount;
      return {
        ...s,
        minutes,
        owned: { ...s.owned, [item.id]: true },
        doubleBoost: item.action === 'boost' ? true : s.doubleBoost,
      };
    });
  }

  function toggleBlocked(id: string) {
    setState((s) => ({ ...s, blocked: { ...s.blocked, [id]: !s.blocked[id] } }));
  }

  const fullOverlay = overlay === 'game' || overlay === 'lock' || overlay === 'shop' || overlay === 'streaks';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* active tab */}
      {tab === 'home' && (
        <HomeScreen
          state={state}
          brand={BRAND}
          onPlay={() => setOverlay('game')}
          onShop={() => setOverlay('shop')}
          onStreak={() => setOverlay('streaks')}
          onOpenApp={openApp}
          onSeeBlocked={() => setTab('blocked')}
        />
      )}
      {tab === 'blocked' && (
        <BlockedScreen state={state} onToggle={toggleBlocked} onPlay={() => setOverlay('game')} />
      )}
      {tab === 'stats' && <StatsScreen state={state} />}
      {tab === 'you' && <ProfileScreen state={state} />}

      {/* tab bar (hidden under full-screen overlays) */}
      {!fullOverlay && (
        <View style={styles.tabBarWrap}>
          <TabBar
            active={tab}
            onTab={setTab}
            onPlay={() => setOverlay('game')}
            bottomInset={insets.bottom}
          />
        </View>
      )}

      {/* overlays */}
      {overlay === 'shop' && (
        <View style={styles.overlay}>
          <ShopScreen state={state} onBack={() => setOverlay(null)} onBuy={buy} />
        </View>
      )}
      {overlay === 'streaks' && (
        <View style={styles.overlay}>
          <StreaksScreen state={state} onClose={() => setOverlay(null)} />
        </View>
      )}
      {overlay === 'lock' && lockApp && (
        <View style={styles.overlay}>
          <LockScreen
            app={lockApp}
            onPlay={() => setOverlay('game')}
            onDismiss={() => {
              setOverlay(null);
              setLockAppId(null);
            }}
          />
        </View>
      )}
      {overlay === 'game' && (
        <View style={styles.overlay}>
          <GameScreen
            reward={REWARD}
            doubleBoost={state.doubleBoost}
            onWin={onWin}
            onExit={() => {
              setOverlay(null);
              setLockAppId(null);
            }}
          />
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
});

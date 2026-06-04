import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const COLORS = ['#00F5FF', '#FF6B35', '#FFD600', '#FF4D6D', '#00D97E', '#9B59F5', '#fff'];
const COUNT = 40;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'rect';
}

interface ConfettiOverlayProps {
  visible: boolean;
}

function createParticle(): Particle {
  return {
    x: new Animated.Value(Math.random() * SW),
    y: new Animated.Value(-20),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  };
}

export function ConfettiOverlay({ visible }: ConfettiOverlayProps) {
  const particles = useRef<Particle[]>(
    Array.from({ length: COUNT }, createParticle)
  );

  useEffect(() => {
    if (!visible) return;

    const animations = particles.current.map((p) => {
      const delay = Math.random() * 400;
      const duration = 1200 + Math.random() * 800;

      // Start at a fresh position, then drift toward a nearby target so the
      // confetti spreads sideways as it falls.
      const startX = Math.random() * SW;
      const targetX = startX + (Math.random() - 0.5) * 200;
      p.x.setValue(startX);
      p.y.setValue(-20);
      p.rotate.setValue(0);
      p.opacity.setValue(1);

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: SH + 50,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: targetX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: (Math.random() - 0.5) * 720,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(duration * 0.7),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((p, i) => {
        const rotateStr = p.rotate.interpolate({
          inputRange: [-720, 720],
          outputRange: ['-720deg', '720deg'],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.shape === 'rect' ? p.size * 1.8 : p.size,
                borderRadius: p.shape === 'circle' ? p.size / 2 : 2,
                backgroundColor: p.color,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate: rotateStr },
                ],
                opacity: p.opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

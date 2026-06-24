// components/Confetti.tsx
// Lightweight falling confetti using the Animated API (no extra libraries).
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

const COLORS = ['#ff5630', '#ff4d6d', '#7b3ff2', '#ffd23f', '#2fbf9e', '#3f9bff'];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  round: boolean;
  rotateTo: string;
};

export default function Confetti({ count = 28, height = 760 }: { count?: number; height?: number }) {
  const pieces = useRef<Piece[]>(
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 500,
      duration: 1400 + Math.random() * 1200,
      color: COLORS[i % COLORS.length],
      round: Math.random() > 0.5,
      rotateTo: `${Math.random() > 0.5 ? '' : '-'}${360 + Math.floor(Math.random() * 360)}deg`,
    }))
  ).current;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <Bit key={i} piece={p} fallTo={height} />
      ))}
    </View>
  );
}

function Bit({ piece, fallTo }: { piece: Piece; fallTo: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-20, fallTo] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', piece.rotateTo] });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0.6] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: `${piece.left}%`,
        width: 11,
        height: piece.round ? 11 : 16,
        borderRadius: piece.round ? 6 : 2,
        borderWidth: 1.5,
        borderColor: '#2b1a10',
        backgroundColor: piece.color,
        transform: [{ translateY }, { rotate }],
        opacity,
      }}
    />
  );
}

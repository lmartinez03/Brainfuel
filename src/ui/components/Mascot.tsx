// components/Mascot.tsx
// The Brainfuel mascot, rendered from the shared Mascot.png so the brand art is
// identical everywhere it appears (home, quiz, onboarding, the top bar, etc.).
import React from 'react';
import { Image, View, ViewStyle, StyleProp } from 'react-native';

export type Expr = 'happy' | 'excited' | 'thinking' | 'sleepy' | 'sad' | 'wink' | 'wow';

const SOURCE = require('../../../assets/Mascot.png');

type Props = {
  size?: number;
  /**
   * Accepted for API compatibility with existing call sites. The mascot is now
   * a single image, so the expression and sprout flags no longer change it.
   */
  expr?: Expr;
  sprout?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Mascot({ size = 90, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image source={SOURCE} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </View>
  );
}

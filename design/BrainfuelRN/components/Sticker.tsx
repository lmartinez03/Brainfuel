// components/Sticker.tsx
// The signature Brainfuel "sticker" surface: a thick ink border with a hard
// (zero-blur) offset shadow drawn as a second layer behind the content.
import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius as R, sticker } from '../theme';

type Props = {
  children?: React.ReactNode;
  bg?: string;
  radius?: number;
  offset?: number;
  shadowColor?: string;
  borderColor?: string;
  /** layout for the OUTER wrapper (flex, width, margins…) */
  style?: StyleProp<ViewStyle>;
  /** styling for the bordered box itself (padding, alignment…) */
  innerStyle?: StyleProp<ViewStyle>;
  flat?: boolean;
};

export default function Sticker({
  children,
  bg = colors.paper,
  radius = R.xl,
  offset = sticker.shadow.md,
  shadowColor = colors.ink,
  borderColor = colors.ink,
  style,
  innerStyle,
  flat,
}: Props) {
  return (
    <View style={style}>
      {!flat && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: offset,
            left: offset,
            width: '100%',
            height: '100%',
            backgroundColor: shadowColor,
            borderRadius: radius,
          }}
        />
      )}
      <View
        style={[
          {
            backgroundColor: bg,
            borderRadius: radius,
            borderWidth: sticker.borderWidth,
            borderColor,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

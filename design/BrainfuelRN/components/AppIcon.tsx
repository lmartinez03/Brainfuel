// components/AppIcon.tsx
// The rounded gradient tile used for each blocked app.
import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

type Props = {
  grad: [string, string];
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function AppIcon({ grad, size = 42, radius = 13, style }: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 2.5,
          borderColor: colors.ink,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={grad}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

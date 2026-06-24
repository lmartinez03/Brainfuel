// components/Button.tsx
// Chunky sticker button. Presses "into" its shadow like the web design.
import React, { useState } from 'react';
import { Pressable, Text, View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius as R, sticker, fonts } from '../theme';

type Variant = 'paper' | 'coral' | 'purple' | 'pink' | 'yellow' | 'teal';

type Props = {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  iconName?: keyof typeof Ionicons.glyphMap;
  lg?: boolean;
  block?: boolean;
  textColor?: string;
  children?: React.ReactNode; // optional leading node (e.g. a mini mascot)
  style?: StyleProp<ViewStyle>;
};

const BG: Record<Variant, string> = {
  paper: colors.paper,
  coral: colors.coral,
  purple: colors.purple,
  pink: colors.pink,
  yellow: colors.yellow,
  teal: colors.teal,
};

export default function Button({
  label,
  onPress,
  variant = 'paper',
  iconName,
  lg,
  block,
  textColor,
  children,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const offset = sticker.shadow.md;
  const fg =
    textColor ?? (variant === 'paper' || variant === 'yellow' ? colors.ink : colors.white);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{ alignSelf: block ? 'stretch' : 'flex-start' }, style]}
    >
      <View>
        {!pressed && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: offset,
              left: offset,
              width: '100%',
              height: '100%',
              backgroundColor: colors.ink,
              borderRadius: R.lg,
            }}
          />
        )}
        <View
          style={[
            styles.box,
            {
              backgroundColor: BG[variant],
              paddingVertical: lg ? 18 : 14,
              transform: pressed ? [{ translateX: offset }, { translateY: offset }] : [],
            },
          ]}
        >
          {children}
          {iconName && <Ionicons name={iconName} size={lg ? 20 : 18} color={fg} />}
          {label ? (
            <Text style={[styles.text, { color: fg, fontSize: lg ? 18 : 16 }]}>{label}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: R.lg,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  text: {
    fontFamily: fonts.heading,
    letterSpacing: 0.2,
  },
});

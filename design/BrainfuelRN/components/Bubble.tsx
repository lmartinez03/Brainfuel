// components/Bubble.tsx
// Speech bubble (white sticker + little tail) used by the mascot.
import React from 'react';
import { View, Text, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { colors, radius as R, sticker, fonts } from '../theme';

type Props = {
  text: string;
  tail?: 'left' | 'none';
  style?: StyleProp<ViewStyle>;
  textColor?: string;
};

export default function Bubble({ text, tail = 'left', style, textColor = colors.ink }: Props) {
  const offset = sticker.shadow.sm;
  return (
    <View style={style}>
      <View>
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
        <View style={styles.box}>
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        </View>
        {tail === 'left' && (
          <View style={styles.tail} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.white,
    borderRadius: R.lg,
    borderWidth: sticker.borderWidth,
    borderColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, lineHeight: 19 },
  tail: {
    position: 'absolute',
    bottom: -8,
    left: 24,
    width: 13,
    height: 13,
    backgroundColor: colors.white,
    borderRightWidth: sticker.borderWidth,
    borderBottomWidth: sticker.borderWidth,
    borderColor: colors.ink,
    transform: [{ rotate: '45deg' }],
  },
});

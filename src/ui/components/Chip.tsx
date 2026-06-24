// components/Chip.tsx
// Small pill with thick border + hard shadow. Used in the top bar, badges, etc.
import React, { useState } from 'react';
import { Pressable, Text, View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { colors, radius as R, sticker, fonts } from '../theme';

type Props = {
  children?: React.ReactNode;
  label?: string;
  bg?: string;
  textColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function Chip({
  children,
  label,
  bg = colors.white,
  textColor = colors.ink,
  onPress,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const offset = sticker.shadow.sm;
  const Container: any = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      onPressIn={onPress ? () => setPressed(true) : undefined}
      onPressOut={onPress ? () => setPressed(false) : undefined}
      style={style}
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
              borderRadius: R.pill,
            }}
          />
        )}
        <View
          style={[
            styles.box,
            {
              backgroundColor: bg,
              transform: pressed ? [{ translateX: offset }, { translateY: offset }] : [],
            },
          ]}
        >
          {children}
          {label ? <Text style={[styles.text, { color: textColor }]}>{label}</Text> : null}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontFamily: fonts.heading,
    fontSize: 14,
  },
});

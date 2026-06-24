// components/Toggle.tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../theme';

export default function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)}>
      <View
        style={{
          width: 50,
          height: 30,
          borderRadius: 15,
          borderWidth: 2.5,
          borderColor: colors.ink,
          backgroundColor: value ? colors.teal : '#e7ddd0',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: colors.white,
            borderWidth: 2.5,
            borderColor: colors.ink,
            marginLeft: value ? 22 : 2,
          }}
        />
      </View>
    </Pressable>
  );
}

// components/Mascot.tsx
// "Noodle" the brain buddy, drawn with React Native primitives.
// expr: happy | excited | thinking | sleepy | sad | wink | wow
import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

export type Expr = 'happy' | 'excited' | 'thinking' | 'sleepy' | 'sad' | 'wink' | 'wow';

type Props = {
  size?: number;
  expr?: Expr;
  sprout?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Mascot({ size = 90, expr = 'happy', sprout = true, style }: Props) {
  const S = size;
  const eyeW = S * 0.26;
  const eyeH = eyeW * 0.96;
  const lineEye = expr === 'sleepy';
  const winkRight = expr === 'wink';
  const bigPupil = expr === 'excited' || expr === 'wow';

  const Eye = ({ asLine, side }: { asLine: boolean; side: 'l' | 'r' }) => {
    if (asLine) {
      return (
        <View
          style={{
            width: eyeW,
            height: 3,
            borderRadius: 3,
            backgroundColor: colors.ink,
          }}
        />
      );
    }
    const pupilSize = eyeW * (bigPupil ? 0.66 : 0.56);
    // pupil vertical placement shifts with expression
    const bottom =
      expr === 'sad' ? eyeH * 0.04 : expr === 'thinking' ? eyeH * 0.34 : eyeH * 0.12;
    const left = expr === 'thinking' && side === 'l' ? eyeW * 0.34 : eyeW * 0.2;
    return (
      <View
        style={{
          width: eyeW,
          height: eyeH,
          borderRadius: eyeW,
          backgroundColor: colors.white,
          borderWidth: 2.6,
          borderColor: colors.ink,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: pupilSize,
            height: pupilSize,
            borderRadius: pupilSize,
            backgroundColor: colors.ink,
            bottom,
            left,
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: pupilSize * 0.4,
              height: pupilSize * 0.4,
              borderRadius: pupilSize,
              backgroundColor: colors.white,
              top: pupilSize * 0.12,
              left: pupilSize * 0.16,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[{ width: S, height: S }, style]}>
      {/* sprout */}
      {sprout && (
        <View
          style={{
            position: 'absolute',
            top: -S * 0.12,
            left: S / 2 - S * 0.04,
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <View
            style={{
              width: S * 0.13,
              height: S * 0.13,
              borderRadius: S * 0.13,
              backgroundColor: colors.teal,
              borderWidth: 2.5,
              borderColor: colors.ink,
            }}
          />
          <View
            style={{
              width: S * 0.08,
              height: S * 0.12,
              borderRadius: S * 0.04,
              backgroundColor: colors.teal,
              borderWidth: 2.5,
              borderColor: colors.ink,
              marginTop: -2,
            }}
          />
        </View>
      )}

      {/* head */}
      <View
        style={{
          width: S,
          height: S,
          borderRadius: S * 0.48,
          borderTopLeftRadius: S * 0.5,
          borderBottomRightRadius: S * 0.46,
          borderWidth: 3,
          borderColor: colors.ink,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={gradients.mascot}
          start={{ x: 0.3, y: 0.15 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {/* eyes */}
      <View
        style={{
          position: 'absolute',
          top: S * 0.36,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: S * 0.13,
        }}
      >
        <Eye asLine={lineEye} side="l" />
        <Eye asLine={lineEye || winkRight} side="r" />
      </View>

      {/* cheeks */}
      <View
        style={{
          position: 'absolute',
          top: S * 0.56,
          left: S * 0.13,
          width: S * 0.15,
          height: S * 0.11,
          borderRadius: S * 0.1,
          backgroundColor: 'rgba(255,110,100,0.6)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: S * 0.56,
          right: S * 0.13,
          width: S * 0.15,
          height: S * 0.11,
          borderRadius: S * 0.1,
          backgroundColor: 'rgba(255,110,100,0.6)',
        }}
      />

      {/* mouth */}
      <Mouth expr={expr} S={S} />
    </View>
  );
}

function Mouth({ expr, S }: { expr: Expr; S: number }) {
  const top = S * 0.63;
  const wrap = (child: React.ReactNode) => (
    <View style={{ position: 'absolute', top, left: 0, right: 0, alignItems: 'center' }}>
      {child}
    </View>
  );

  if (expr === 'excited' || expr === 'wow') {
    return wrap(
      <View
        style={{
          width: S * 0.26,
          height: S * 0.24,
          backgroundColor: '#c23a52',
          borderWidth: 3,
          borderColor: colors.ink,
          borderTopLeftRadius: S * 0.12,
          borderTopRightRadius: S * 0.12,
          borderBottomLeftRadius: S * 0.16,
          borderBottomRightRadius: S * 0.16,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: S * 0.14,
            height: S * 0.08,
            borderRadius: S * 0.06,
            backgroundColor: '#ff7a8e',
            marginBottom: 2,
          }}
        />
      </View>
    );
  }

  if (expr === 'sad') {
    return wrap(
      <View style={{ width: S * 0.2, height: 3, borderRadius: 2, backgroundColor: colors.ink }} />
    );
  }

  // happy / thinking / sleepy => a "U" smile (small for thinking/sleepy)
  const w = expr === 'thinking' || expr === 'sleepy' ? S * 0.16 : S * 0.3;
  const h = expr === 'thinking' || expr === 'sleepy' ? S * 0.1 : S * 0.16;
  return wrap(
    <View
      style={{
        width: w,
        height: h,
        borderWidth: 3,
        borderTopWidth: 0,
        borderColor: colors.ink,
        borderBottomLeftRadius: w,
        borderBottomRightRadius: w,
      }}
    />
  );
}

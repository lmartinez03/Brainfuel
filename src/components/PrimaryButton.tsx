import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow, typography } from '../theme';

type Variant = 'cyan' | 'orange' | 'coral' | 'purple' | 'green' | 'ghost' | 'danger';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const GRADIENTS: Record<Variant, readonly [string, string] | null> = {
  cyan: colors.gradient.cyan,
  orange: colors.gradient.orange,
  coral: colors.gradient.coral,
  purple: colors.gradient.purple,
  green: colors.gradient.green,
  ghost: null,
  danger: colors.gradient.failBanner,
};

const SHADOWS: Record<Variant, object> = {
  cyan: shadow.cyan,
  orange: shadow.orange,
  coral: { ...shadow.lg, shadowColor: '#FF4D6D' },
  purple: { ...shadow.lg, shadowColor: '#9B59F5' },
  green: { ...shadow.lg, shadowColor: '#00D97E' },
  ghost: {},
  danger: { ...shadow.lg, shadowColor: '#FF4D6D' },
};

const HEIGHT = { sm: 44, md: 54, lg: 64 };
const FONT_SIZE = { sm: 14, md: 16, lg: 18 };

export function PrimaryButton({
  label,
  onPress,
  variant = 'cyan',
  loading = false,
  disabled = false,
  size = 'md',
  style,
  textStyle,
  icon,
  fullWidth = true,
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacity, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 15,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const gradient = GRADIENTS[variant];
  const btnShadow = disabled ? {} : SHADOWS[variant];

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        btnShadow,
        { transform: [{ scale }], opacity: disabled ? 0.5 : opacity },
        style,
      ]}
    >
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          { height: HEIGHT[size] },
          variant === 'ghost' && styles.ghostBorder,
        ]}
      >
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        {variant === 'ghost' && <LinearGradient
          colors={['rgba(0,245,255,0.05)', 'rgba(0,245,255,0.02)']}
          style={StyleSheet.absoluteFillObject}
        />}
        {loading ? (
          <ActivityIndicator
            color={variant === 'ghost' ? colors.brand.cyan : colors.text.inverse}
            size="small"
          />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.label,
                { fontSize: FONT_SIZE[size] },
                variant === 'ghost' && { color: colors.brand.cyan },
                textStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  ghostBorder: {
    borderWidth: 1.5,
    borderColor: colors.border.accent,
  },
  label: {
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.text.inverse,
    letterSpacing: 0.3,
  },
});

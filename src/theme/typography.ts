import { Platform } from 'react-native';

// Nunito: rounded, playful, readable. Perfect for a gamified app.
// Space Mono: techy monospace for scores, timers, and numbers
export const fontFamilies = {
  display: 'Nunito_900Black',
  displayBold: 'Nunito_800ExtraBold',
  heading: 'Nunito_700Bold',
  body: 'Nunito_600SemiBold',
  bodyRegular: 'Nunito_400Regular',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const typography = {
  hero: {
    fontFamily: fontFamilies.display,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 26,
  },
  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fontFamilies.heading,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  score: {
    fontFamily: fontFamilies.mono,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -2,
  },
  counter: {
    fontFamily: fontFamilies.mono,
    fontSize: 28,
    lineHeight: 36,
  },
  tag: {
    fontFamily: fontFamilies.heading,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export type Typography = typeof typography;

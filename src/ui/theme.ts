// theme.ts
// Every color, gradient, spacing, radius and font value used in Brainfuel.
// Pull from here so the whole app stays consistent.

export const colors = {
  ink: '#2b1a10',      // near-black brown: borders, text, hard shadows
  bg: '#ffbf57',       // app background (warm orange)
  bg2: '#ffd089',      // lighter orange
  paper: '#fffaf2',    // card surface (warm white)
  coral: '#ff5630',    // primary accent / screen-time hero
  pink: '#ff4d6d',     // play button / highlights
  purple: '#7b3ff2',   // blocked / secondary
  yellow: '#ffd23f',   // coins / minutes / accents
  teal: '#2fbf9e',     // success / brain XP
  blue: '#3f9bff',     // info
  muted: '#9a8470',    // muted text
  white: '#ffffff',
} as const;

// expo-linear-gradient color stops (start = top-left, end = bottom-right).
export const gradients = {
  scrollr: ['#ff6f91', '#ff3d6e'] as [string, string],
  loopz: ['#ffb24d', '#ff7a3c'] as [string, string],
  chattr: ['#ffd23f', '#ffae18'] as [string, string],
  pulse: ['#7b6cff', '#5a3ff2'] as [string, string],
  snapz: ['#3fd0ff', '#3f9bff'] as [string, string],
  mascot: ['#ffd9cb', '#ff8f78'] as [string, string],
  mascotShine: ['#ffe7dd', '#ff9d8a'] as [string, string],
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 22,
  pill: 100,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 15,
  xl: 18,
  xxl: 24,
} as const;

// The bold "sticker" look = thick ink border + hard (0-blur) offset shadow.
export const sticker = {
  borderWidth: 3,
  borderColor: colors.ink,
  shadow: { sm: 3, md: 4, lg: 6 }, // offset distance in px (down + right)
} as const;

/**
 * Baloo 2 (chunky, for headings & numbers) and Nunito (rounded, for body).
 * The families are loaded in app/_layout.tsx via @expo-google-fonts.
 * Use fontFamily from here to match the design 1:1.
 */
export const fonts = {
  heading: 'Baloo2_800ExtraBold' as string,
  headingBold: 'Baloo2_700Bold' as string,
  body: 'Nunito_800ExtraBold' as string,
  bodyRegular: 'Nunito_700Bold' as string,
  // weights kept as fallbacks for any inline overrides
  weight: {
    heading: '800' as const,
    headingHeavy: '900' as const,
    body: '700' as const,
    bodyHeavy: '800' as const,
  },
} as const;

export type ColorName = keyof typeof colors;

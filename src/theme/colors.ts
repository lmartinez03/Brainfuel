export const colors = {
  // Background layers
  bg: {
    primary: '#0D0F1A',
    secondary: '#151829',
    card: '#1C2035',
    cardAlt: '#1A1E30',
    overlay: 'rgba(13, 15, 26, 0.92)',
  },

  // Brand / accent
  brand: {
    cyan: '#00F5FF',
    cyanDim: '#00C4CC',
    orange: '#FF6B35',
    orangeDim: '#E05A28',
    coral: '#FF4D6D',
    coralDim: '#D93D5A',
    yellow: '#FFD600',
    yellowDim: '#E6C100',
    purple: '#9B59F5',
    purpleDim: '#7B3FD4',
    green: '#00D97E',
    greenDim: '#00B068',
  },

  // Text
  text: {
    primary: '#F0F2FF',
    secondary: '#8B90A8',
    tertiary: '#555A72',
    inverse: '#0D0F1A',
    onBrand: '#0D0F1A',
  },

  // Status
  status: {
    success: '#00D97E',
    error: '#FF4D6D',
    warning: '#FFD600',
    info: '#00F5FF',
  },

  // Borders / dividers
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.12)',
    accent: 'rgba(0, 245, 255, 0.3)',
  },

  // Gradients (expressed as arrays for LinearGradient)
  gradient: {
    cyan: ['#00F5FF', '#0099CC'] as const,
    orange: ['#FF6B35', '#FF3D00'] as const,
    coral: ['#FF4D6D', '#C0102E'] as const,
    purple: ['#9B59F5', '#6B21D4'] as const,
    green: ['#00D97E', '#007A46'] as const,
    yellow: ['#FFD600', '#FF8C00'] as const,
    dark: ['#1C2035', '#0D0F1A'] as const,
    hero: ['#0D0F1A', '#151829', '#1C2035'] as const,
    successBanner: ['#00D97E', '#00B068'] as const,
    failBanner: ['#FF4D6D', '#C0102E'] as const,
  },
};

export type Colors = typeof colors;

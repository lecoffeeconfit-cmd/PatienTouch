/** Platform-neutral values. No DOM or React Native imports. */
export const colors = {
  navy: '#122D43',
  primary: '#247B94',
  teal: '#247B94',
  green: '#6FAFA5',
  mint: '#EAF5F2',
  background: '#F3F6F8',
  white: '#FFFFFF',
  text: '#122D43',
  secondary: '#5A6C79',
  muted: '#5A6C79',
  border: '#DFE7EB',
  danger: '#AB3C45',
  warning: '#8B641C',
  success: '#37796B',
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radii = { sm: 8, md: 12, lg: 18, xl: 24, full: 999 } as const;
export const typography = {
  family: 'system-ui',
  sizes: { caption: 12, small: 14, body: 16, title: 24, display: 36 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;
export const tokens = { colors, spacing, radii, typography };

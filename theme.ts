// Theme constants for React Native Paper and consistent styling
export const colors = {
  primary: '#3b82f6',
  primaryContainer: '#dbeafe',
  secondary: '#6b7280',
  secondaryContainer: '#f3f4f6',
  tertiary: '#10b981',
  tertiaryContainer: '#d1fae5',
  surface: '#ffffff',
  surfaceVariant: '#f8fafc',
  background: '#ffffff',
  error: '#ef4444',
  errorContainer: '#fee2e2',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#1e40af',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#374151',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#065f46',
  onSurface: '#111827',
  onSurfaceVariant: '#64748b',
  onBackground: '#111827',
  onError: '#ffffff',
  onErrorContainer: '#991b1b',
  outline: '#d1d5db',
  outlineVariant: '#e5e7eb',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1f2937',
  inverseOnSurface: '#f9fafb',
  inversePrimary: '#93c5fd',
  elevation: {
    level0: 'transparent',
    level1: '#ffffff',
    level2: '#ffffff',
    level3: '#ffffff',
    level4: '#ffffff',
    level5: '#ffffff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold' as 'bold',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'bold' as 'bold',
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as '600',
  },
  titleLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as '600',
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as '600',
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as '500',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as '500',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as '500',
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500' as '500',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal' as 'normal',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'normal' as 'normal',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'normal' as 'normal',
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;
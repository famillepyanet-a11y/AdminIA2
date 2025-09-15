import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { View, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { 
        paddingVertical: spacing.xs / 2, 
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
      },
      md: { 
        paddingVertical: spacing.xs, 
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
      },
      lg: { 
        paddingVertical: spacing.sm, 
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: { backgroundColor: colors.surfaceVariant },
      success: { backgroundColor: colors.tertiary },
      warning: { backgroundColor: '#f59e0b' },
      error: { backgroundColor: colors.error },
      info: { backgroundColor: colors.primary },
    };

    return {
      alignSelf: 'flex-start',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: typography.labelSmall,
      md: typography.labelMedium,
      lg: typography.labelLarge,
    };

    const variantStyles: Record<string, TextStyle> = {
      default: { color: colors.onSurfaceVariant },
      success: { color: colors.onTertiary },
      warning: { color: '#ffffff' },
      error: { color: colors.onError },
      info: { color: colors.onPrimary },
    };

    return {
      fontWeight: '500',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{children}</Text>
    </View>
  );
}
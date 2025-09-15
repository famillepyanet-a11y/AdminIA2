import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ButtonProps extends Omit<PaperButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  labelStyle,
  children,
  ...props
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      ...(fullWidth && { width: '100%' }),
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
      md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
      lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.secondary },
      outline: { 
        backgroundColor: 'transparent', 
        borderWidth: 1, 
        borderColor: colors.outline 
      },
      ghost: { backgroundColor: 'transparent' },
      destructive: { backgroundColor: colors.error },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getLabelStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: typography.labelMedium,
      md: typography.labelLarge,
      lg: typography.titleSmall,
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: colors.onPrimary },
      secondary: { color: colors.onSecondary },
      outline: { color: colors.onSurface },
      ghost: { color: colors.primary },
      destructive: { color: colors.onError },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const mode = variant === 'outline' ? 'outlined' : 
               variant === 'ghost' ? 'text' : 'contained';

  return (
    <PaperButton
      mode={mode}
      style={[getButtonStyle(), style]}
      labelStyle={[getLabelStyle(), labelStyle]}
      {...props}
    >
      {children}
    </PaperButton>
  );
}
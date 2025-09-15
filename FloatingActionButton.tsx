import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, FABProps } from 'react-native-paper';
import { colors, spacing } from '@/constants/theme';

interface FloatingActionButtonProps extends Omit<FABProps, 'style'> {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'surface';
}

export function FloatingActionButton({
  position = 'bottom-right',
  size = 'medium',
  variant = 'primary',
  ...props
}: FloatingActionButtonProps) {
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: spacing.lg + 60, // Account for tab bar
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, right: spacing.lg };
      case 'bottom-left':
        return { ...baseStyle, left: spacing.lg };
      case 'bottom-center':
        return { ...baseStyle, alignSelf: 'center' };
      default:
        return { ...baseStyle, right: spacing.lg };
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: colors.onPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: colors.onSecondary,
        };
      case 'surface':
        return {
          backgroundColor: colors.surface,
          color: colors.onSurface,
        };
      default:
        return {
          backgroundColor: colors.primary,
          color: colors.onPrimary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'medium':
        return { width: 56, height: 56 };
      case 'large':
        return { width: 72, height: 72 };
      default:
        return { width: 56, height: 56 };
    }
  };

  return (
    <FAB
      size={size}
      style={[
        getPositionStyle(),
        getSizeStyle(),
        getVariantStyle(),
        styles.fab,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
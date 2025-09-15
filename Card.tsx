import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface CardProps extends PaperCardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof spacing;
}

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.outline,
        elevation: 0,
      },
      elevated: {
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return (
    <PaperCard style={[getCardStyle(), style]} {...props}>
      {children}
    </PaperCard>
  );
}

export const CardContent = PaperCard.Content;
export const CardActions = PaperCard.Actions;
export const CardCover = PaperCard.Cover;
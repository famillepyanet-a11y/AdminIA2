import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'flat';
}

export function Input({
  error,
  helperText,
  variant = 'outlined',
  style,
  ...props
}: InputProps) {
  return (
    <>
      <TextInput
        mode={variant}
        error={!!error}
        style={[styles.input, style]}
        theme={{
          colors: {
            primary: colors.primary,
            outline: error ? colors.error : colors.outline,
            outlineVariant: colors.outlineVariant,
            surface: colors.surface,
            surfaceVariant: colors.surfaceVariant,
            onSurface: colors.onSurface,
            onSurfaceVariant: colors.onSurfaceVariant,
          },
        }}
        {...props}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible>
          {error || helperText}
        </HelperText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    fontSize: typography.bodyMedium.fontSize,
    marginBottom: spacing.xs,
  },
});
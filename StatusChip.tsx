import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, ChipProps } from 'react-native-paper';
import { colors, spacing } from '@/constants/theme';

interface StatusChipProps extends Omit<ChipProps, 'mode'> {
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function StatusChip({ status, style, ...props }: StatusChipProps) {
  const getStatusConfig = () => {
    const configs = {
      pending: {
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        textColor: '#92400e',
        icon: 'clock-outline',
      },
      processing: {
        color: colors.primary,
        backgroundColor: colors.primaryContainer,
        textColor: colors.onPrimaryContainer,
        icon: 'loading',
      },
      completed: {
        color: colors.tertiary,
        backgroundColor: colors.tertiaryContainer,
        textColor: colors.onTertiaryContainer,
        icon: 'check',
      },
      error: {
        color: colors.error,
        backgroundColor: colors.errorContainer,
        textColor: colors.onErrorContainer,
        icon: 'alert',
      },
    };

    return configs[status];
  };

  const config = getStatusConfig();

  return (
    <Chip
      mode="flat"
      icon={config.icon}
      style={[
        {
          backgroundColor: config.backgroundColor,
        },
        style,
      ]}
      textStyle={{
        color: config.textColor,
        fontSize: 12,
        fontWeight: '500',
      }}
      {...props}
    />
  );
}
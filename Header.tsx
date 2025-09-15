import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, AppbarProps } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface HeaderProps extends Omit<AppbarProps, 'children'> {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  centered?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
  centered = false,
  style,
  ...props
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Appbar.Header
      style={[
        styles.header,
        { paddingTop: insets.top },
        style,
      ]}
      {...props}
    >
      {showBack && (
        <Appbar.BackAction onPress={onBack} />
      )}
      
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={[
          styles.title,
          centered && styles.centeredTitle,
        ]}
        subtitleStyle={styles.subtitle}
      />
      
      {actions && (
        <View style={styles.actions}>
          {actions}
        </View>
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '600',
  },
  centeredTitle: {
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
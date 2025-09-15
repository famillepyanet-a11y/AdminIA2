import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Modal as RNModal, Portal, Surface, IconButton } from 'react-native-paper';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  dismissable?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function Modal({
  visible,
  onDismiss,
  children,
  showCloseButton = true,
  dismissable = true,
  contentContainerStyle,
}: ModalProps) {
  return (
    <Portal>
      <RNModal
        visible={visible}
        onDismiss={dismissable ? onDismiss : undefined}
        contentContainerStyle={[styles.container, contentContainerStyle]}
        dismissable={dismissable}
      >
        <Surface style={styles.surface} elevation={5}>
          {showCloseButton && (
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
              iconColor={colors.onSurface}
            />
          )}
          {children}
        </Surface>
      </RNModal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: '100%',
    maxHeight: '90%',
    minWidth: 280,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    zIndex: 1,
  },
});
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text, ViewStyle } from 'react-native';
import { Portal, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: () => void;
  position?: 'top' | 'bottom';
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  position = 'bottom',
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getTypeStyle = (): ViewStyle => {
    const typeStyles = {
      success: { backgroundColor: colors.tertiary },
      error: { backgroundColor: colors.error },
      warning: { backgroundColor: '#f59e0b' },
      info: { backgroundColor: colors.primary },
    };

    return typeStyles[type];
  };

  const getTextColor = () => {
    const textColors = {
      success: colors.onTertiary,
      error: colors.onError,
      warning: '#ffffff',
      info: colors.onPrimary,
    };

    return textColors[type];
  };

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            [position]: position === 'top' ? insets.top + spacing.md : insets.bottom + spacing.md,
          },
        ]}
      >
        <Surface
          style={[
            styles.toast,
            getTypeStyle(),
          ]}
          elevation={6}
        >
          <Text style={[styles.message, { color: getTextColor() }]}>
            {message}
          </Text>
        </Surface>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    ...typography.bodyMedium,
    textAlign: 'center',
    fontWeight: '500',
  },
});
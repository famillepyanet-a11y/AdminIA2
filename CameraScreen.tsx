import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants/theme';
import type { CameraStackScreenProps } from '@/navigation/types';

export function CameraScreen({ navigation }: CameraStackScreenProps<'CameraView'>) {
  const { t } = useTranslation();

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Camera</Text>
        <Text style={styles.subtitle}>Camera functionality coming soon...</Text>
        
        <Button 
          mode="outlined" 
          onPress={handleClose}
          style={styles.closeButton}
        >
          {t('button.cancel')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
  },
  closeButton: {
    borderColor: colors.outline,
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants/theme';
import type { RootStackScreenProps } from '@/navigation/types';

export function DocumentDetailScreen({ navigation, route }: RootStackScreenProps<'DocumentDetail'>) {
  const { t } = useTranslation();
  const { documentId } = route.params;

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Document Detail</Text>
        <Text style={styles.subtitle}>Document ID: {documentId}</Text>
        <Text style={styles.description}>Document details coming soon...</Text>
        
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
    color: colors.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
  },
  closeButton: {
    borderColor: colors.outline,
  },
});
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Card, 
  Text, 
  Header, 
  LoadingSpinner, 
  Toast 
} from '@/components/ui';
import { cameraService } from '@/services/cameraService';
import { colors, spacing, typography } from '@/constants/theme';
import type { MainTabScreenProps } from '@/navigation/types';
import type { DocumentScanResult } from '@/services/cameraService';

export function ScanScreen({ navigation }: MainTabScreenProps<'Scan'>) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await cameraService.takePicture({
        quality: 0.8,
        allowsEditing: true,
      });

      // Navigate to camera preview with the captured image
      navigation.navigate('CameraStack', {
        screen: 'CameraPreview',
        params: { imageUri: result.uri },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      setError(errorMessage);
      console.error('Camera error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await cameraService.pickFromGallery({
        quality: 0.8,
        allowsEditing: true,
      });

      // Navigate to camera preview with the selected image
      navigation.navigate('CameraStack', {
        screen: 'CameraPreview',
        params: { imageUri: result.uri },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select image';
      setError(errorMessage);
      console.error('Gallery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showPermissionInfo = () => {
    Alert.alert(
      'Permissions Required',
      'To scan documents, AdminIA needs access to your camera and photo library. You can grant these permissions in the next step.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: handleTakePhoto },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('mobile.scan')} />
        <LoadingSpinner text="Preparing camera..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('mobile.scan')} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('actions.scan.title')}</Text>
          <Text style={styles.subtitle}>{t('actions.scan.description')}</Text>
        </View>

        <View style={styles.options}>
          <Card style={styles.optionCard}>
            <View style={styles.cardContent}>
              <Text style={styles.optionIcon}>📷</Text>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionDescription}>
                Use your camera to capture a document
              </Text>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleTakePhoto}
                disabled={isLoading}
                style={styles.optionButton}
              >
                Open Camera
              </Button>
            </View>
          </Card>

          <Card style={styles.optionCard}>
            <View style={styles.cardContent}>
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionTitle}>Choose from Gallery</Text>
              <Text style={styles.optionDescription}>
                Select an existing photo from your gallery
              </Text>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onPress={handleChooseFromGallery}
                disabled={isLoading}
                style={styles.optionButton}
              >
                Browse Gallery
              </Button>
            </View>
          </Card>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>📋 Scanning Tips</Text>
          <Text style={styles.tip}>• Ensure good lighting</Text>
          <Text style={styles.tip}>• Keep the document flat</Text>
          <Text style={styles.tip}>• Fill the frame with the document</Text>
          <Text style={styles.tip}>• Avoid shadows and glare</Text>
        </View>
      </View>

      <Toast
        visible={showError}
        message={error || 'An error occurred'}
        type="error"
        onDismiss={() => setShowError(false)}
      />
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  options: {
    flex: 1,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  cardContent: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  optionTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    textAlign: 'center',
  },
  optionDescription: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionButton: {
    marginTop: spacing.sm,
  },
  tips: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 12,
  },
  tipsTitle: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  tip: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
});
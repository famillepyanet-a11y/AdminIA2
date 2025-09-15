import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Header, 
  Text, 
  Card, 
  LoadingSpinner, 
  Toast 
} from '@/components/ui';
import { cameraService } from '@/services/cameraService';
import { colors, spacing, typography } from '@/constants/theme';
import type { CameraStackScreenProps } from '@/navigation/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function CameraPreviewScreen({ navigation, route }: CameraStackScreenProps<'CameraPreview'>) {
  const { t } = useTranslation();
  const { imageUri } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Copy image to app directory
      const localUri = await cameraService.copyToAppDirectory(imageUri);
      
      // Validate the image
      const validation = await cameraService.validateImageFile(localUri);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Here you would typically:
      // 1. Upload to object storage
      // 2. Create document record in database
      // 3. Queue for AI processing
      console.log('Document saved:', localUri);
      
      // Navigate back to documents or show success
      navigation.navigate('MainTab', { screen: 'Documents' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
      setError(errorMessage);
      setShowError(true);
      console.error('Save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleClose = () => {
    navigation.navigate('MainTab', { screen: 'Scan' });
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="Processing Document" 
          showBack 
          onBack={handleClose}
        />
        <LoadingSpinner text="Saving document..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Preview Document" 
        showBack 
        onBack={handleClose}
      />
      
      <View style={styles.content}>
        <Card style={styles.imageCard}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="contain"
          />
        </Card>
        
        <View style={styles.info}>
          <Text style={styles.infoTitle}>Document Preview</Text>
          <Text style={styles.infoText}>
            Review your scanned document. Make sure the text is clear and readable.
          </Text>
        </View>
        
        <View style={styles.actions}>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={handleRetake}
            disabled={isProcessing}
            style={styles.actionButton}
          >
            Retake Photo
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSave}
            disabled={isProcessing}
            style={styles.actionButton}
          >
            {t('button.save')} Document
          </Button>
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
  imageCard: {
    flex: 1,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    padding: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  info: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  infoTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    minHeight: 48,
  },
});
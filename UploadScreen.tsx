import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Header, 
  Toast,
  FloatingActionButton
} from '@/components/ui';
import { FileUploader } from '@/components/upload/FileUploader';
import { colors, spacing } from '@/constants/theme';
import type { MainTabScreenProps } from '@/navigation/types';

export function UploadScreen({ navigation }: MainTabScreenProps<'Upload'>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');

  const handleUploadComplete = (documentId: string) => {
    console.log('Upload completed:', documentId);
    setMessage('Document uploaded successfully!');
    setShowSuccess(true);
    
    // Invalidate documents query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    
    // Navigate to documents screen after a delay
    setTimeout(() => {
      navigation.navigate('Documents');
    }, 2000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setMessage(error);
    setShowError(true);
  };

  const handleQuickScan = () => {
    navigation.navigate('Scan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('mobile.upload')} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          multiple={true}
        />
      </ScrollView>

      <FloatingActionButton
        icon="camera"
        label="Quick Scan"
        onPress={handleQuickScan}
        position="bottom-right"
        variant="primary"
      />

      <Toast
        visible={showSuccess}
        message={message}
        type="success"
        onDismiss={() => setShowSuccess(false)}
        duration={3000}
      />

      <Toast
        visible={showError}
        message={message}
        type="error"
        onDismiss={() => setShowError(false)}
        duration={5000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 60, // Account for FAB
  },
});
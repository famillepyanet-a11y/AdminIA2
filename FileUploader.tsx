import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Button, 
  Card, 
  Text, 
  LoadingSpinner, 
  ProgressBar,
  Badge 
} from '@/components/ui';
import { fileUploadService } from '@/services/fileUploadService';
import { colors, spacing, typography } from '@/constants/theme';
import type { FileUploadResult, UploadProgress } from '@/services/fileUploadService';

interface FileUploaderProps {
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
  title?: string;
  category?: string;
  multiple?: boolean;
  acceptedTypes?: string[];
}

export function FileUploader({
  onUploadComplete,
  onUploadError,
  title,
  category,
  multiple = false,
  acceptedTypes,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileUploadResult[]>([]);

  const handleSelectFiles = async () => {
    try {
      const files = await fileUploadService.pickDocument({
        type: acceptedTypes || fileUploadService.getSupportedFileTypes(),
        multiple,
        copyToCacheDirectory: true,
      });

      setSelectedFiles(files);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select files';
      onUploadError?.(errorMessage);
      console.error('File selection error:', error);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      onUploadError?.('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      for (const file of selectedFiles) {
        const uploadRequest = {
          file,
          title: title || file.name,
          category,
        };

        const result = await fileUploadService.uploadDocument(
          uploadRequest,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        onUploadComplete?.(result.id);
      }

      // Reset state after successful upload
      setSelectedFiles([]);
      setUploadProgress(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setUploadProgress(null);
  };

  const formatFileSize = (bytes: number) => {
    return fileUploadService.formatFileSize(bytes);
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'info';
    if (mimeType === 'application/pdf') return 'error';
    if (mimeType.startsWith('text/')) return 'success';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Card style={styles.uploaderCard}>
        <View style={styles.content}>
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            Select files from your device to upload and process
          </Text>

          {/* File Selection */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={handleSelectFiles}
              disabled={isUploading}
              style={styles.selectButton}
            >
              📁 Select Files
            </Button>
          </View>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <View style={styles.filesList}>
              <View style={styles.filesHeader}>
                <Text style={styles.filesTitle}>
                  Selected Files ({selectedFiles.length})
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleClearAll}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </View>

              {selectedFiles.map((file, index) => (
                <Card key={index} style={styles.fileCard}>
                  <View style={styles.fileInfo}>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <View style={styles.fileMetadata}>
                        <Badge 
                          variant={getFileTypeColor(file.mimeType)}
                          size="sm"
                        >
                          {file.mimeType.split('/')[1].toUpperCase()}
                        </Badge>
                        <Text style={styles.fileSize}>
                          {formatFileSize(file.size)}
                        </Text>
                      </View>
                    </View>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      ✕
                    </Button>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress && (
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Uploading... {uploadProgress.percentage}%
              </Text>
              <ProgressBar 
                progress={uploadProgress.percentage / 100} 
                style={styles.progressBar}
              />
              <Text style={styles.progressDetails}>
                {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
              </Text>
            </View>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <View style={styles.uploadSection}>
              {isUploading ? (
                <LoadingSpinner 
                  text="Uploading files..."
                  centered={false}
                />
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleUpload}
                  disabled={isUploading}
                >
                  📤 Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                </Button>
              )}
            </View>
          )}

          {/* File Type Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Supported File Types</Text>
            <Text style={styles.infoText}>
              Images (JPG, PNG, WebP), Documents (PDF, DOC, DOCX), Text files (TXT, CSV)
            </Text>
            <Text style={styles.infoText}>
              Maximum file size: {formatFileSize(fileUploadService.getMaxFileSize())}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploaderCard: {
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.titleLarge,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.md,
  },
  selectButton: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.outline,
  },
  filesList: {
    gap: spacing.sm,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filesTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    fontWeight: '600',
  },
  fileCard: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  fileName: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '500',
  },
  fileMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fileSize: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  progressSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressText: {
    ...typography.labelLarge,
    color: colors.onSurface,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
  },
  progressDetails: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  uploadSection: {
    marginTop: spacing.md,
  },
  infoSection: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  infoTitle: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
});
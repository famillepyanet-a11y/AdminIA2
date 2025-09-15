import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import { platformConfig } from '@/utils/platform';

export interface FileUploadResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  localUri?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentUploadRequest {
  file: FileUploadResult;
  title?: string;
  category?: string;
  description?: string;
}

export interface DocumentUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadUrl?: string;
  fields?: Record<string, string>;
}

export class FileUploadService {
  private static instance: FileUploadService;

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  async pickDocument(options?: {
    type?: string | string[];
    multiple?: boolean;
    copyToCacheDirectory?: boolean;
  }): Promise<FileUploadResult[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: options?.type || ['image/*', 'application/pdf', 'text/*'],
        multiple: options?.multiple || false,
        copyToCacheDirectory: options?.copyToCacheDirectory ?? true,
      });

      if (result.canceled || !result.assets) {
        throw new Error('Document selection was cancelled');
      }

      const files: FileUploadResult[] = [];

      for (const asset of result.assets) {
        // Validate file size
        if (asset.size && asset.size > platformConfig.storage.maxFileSize) {
          throw new Error(`File "${asset.name}" is too large. Maximum size is ${Math.round(platformConfig.storage.maxFileSize / 1024 / 1024)}MB`);
        }

        // Validate file type
        const isValidType = this.validateFileType(asset.mimeType || '', asset.name);
        if (!isValidType) {
          throw new Error(`File type "${asset.mimeType}" is not supported`);
        }

        files.push({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
        });
      }

      return files;
    } catch (error) {
      console.error('Document picker error:', error);
      throw error;
    }
  }

  async uploadDocument(
    request: DocumentUploadRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentUploadResponse> {
    try {
      // Step 1: Get upload URL from backend
      const uploadResponse = await apiClient.post<DocumentUploadResponse>(
        API_ENDPOINTS.DOCUMENTS_UPLOAD,
        {
          filename: request.file.name,
          mimeType: request.file.mimeType,
          size: request.file.size,
          title: request.title,
          category: request.category,
          description: request.description,
        }
      );

      // Step 2: Upload file to object storage
      if (uploadResponse.uploadUrl && uploadResponse.fields) {
        await this.uploadToObjectStorage(
          request.file,
          uploadResponse.uploadUrl,
          uploadResponse.fields,
          onProgress
        );
      }

      return uploadResponse;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  private async uploadToObjectStorage(
    file: FileUploadResult,
    uploadUrl: string,
    fields: Record<string, string>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    const formData = new FormData();

    // Add fields first
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add file last
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType,
      name: file.name,
    } as any);

    try {
      await this.uploadWithProgress(uploadUrl, formData, onProgress);
    } catch (error) {
      console.error('Object storage upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  private async uploadWithProgress(
    url: string,
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  async copyToLocalDirectory(uri: string, filename?: string): Promise<string> {
    const documentsDir = FileSystem.documentDirectory + 'uploads/';
    
    // Ensure uploads directory exists
    const dirInfo = await FileSystem.getInfoAsync(documentsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
    }

    const finalFilename = filename || `upload_${Date.now()}`;
    const destUri = documentsDir + finalFilename;

    try {
      await FileSystem.copyAsync({
        from: uri,
        to: destUri,
      });
      return destUri;
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw new Error('Failed to copy file to local directory');
    }
  }

  async getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
    return await FileSystem.getInfoAsync(uri);
  }

  async deleteLocalFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri);
    } catch (error) {
      console.error('Failed to delete local file:', error);
    }
  }

  private validateFileType(mimeType: string, filename: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      // Documents
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Text files
      'text/xml',
      'application/json',
    ];

    // Check by MIME type first
    if (allowedTypes.includes(mimeType.toLowerCase())) {
      return true;
    }

    // Fallback to file extension
    const extension = filename.toLowerCase().split('.').pop();
    const allowedExtensions = [
      'jpg', 'jpeg', 'png', 'webp', 'gif',
      'pdf', 'txt', 'csv', 'doc', 'docx', 'xls', 'xlsx',
      'xml', 'json'
    ];

    return allowedExtensions.includes(extension || '');
  }

  getSupportedFileTypes(): string[] {
    return [
      'image/*',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
  }

  getMaxFileSize(): number {
    return platformConfig.storage.maxFileSize;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = FileUploadService.getInstance();
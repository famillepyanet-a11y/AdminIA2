import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { PermissionManager } from '@/utils/permissions';
import { platformConfig } from '@/utils/platform';
import type { CameraResult, DocumentPickerResult } from '@/types/api';

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  base64?: boolean;
}

export interface DocumentScanResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  base64?: string;
  filename: string;
}

export class CameraService {
  private static instance: CameraService;

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  async checkPermissions(): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
    allGranted: boolean;
  }> {
    return await PermissionManager.checkAllPermissions();
  }

  async requestPermissions(): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
    allGranted: boolean;
  }> {
    const permissions = await PermissionManager.requestAllPermissions();
    return {
      ...permissions,
      allGranted: permissions.camera && permissions.mediaLibrary,
    };
  }

  async takePicture(options: CameraOptions = {}): Promise<DocumentScanResult> {
    // Check permissions first
    const permissions = await this.checkPermissions();
    if (!permissions.camera) {
      const requested = await this.requestPermissions();
      if (!requested.camera) {
        throw new Error('Camera permission is required to take pictures');
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options.quality || platformConfig.camera.quality,
      allowsEditing: options.allowsEditing || platformConfig.camera.allowsEditing,
      aspect: options.aspect || platformConfig.camera.aspect,
      base64: options.base64 || false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      throw new Error('Camera capture was cancelled');
    }

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    if (!fileInfo.exists) {
      throw new Error('Captured image file not found');
    }

    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      size: fileInfo.size || 0,
      base64: asset.base64,
      filename: this.generateFilename(),
    };
  }

  async pickFromGallery(options: CameraOptions = {}): Promise<DocumentScanResult> {
    // Check permissions first
    const permissions = await this.checkPermissions();
    if (!permissions.mediaLibrary) {
      const requested = await this.requestPermissions();
      if (!requested.mediaLibrary) {
        throw new Error('Media library permission is required to select images');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: options.quality || platformConfig.camera.quality,
      allowsEditing: options.allowsEditing || platformConfig.camera.allowsEditing,
      aspect: options.aspect || platformConfig.camera.aspect,
      base64: options.base64 || false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      throw new Error('Image selection was cancelled');
    }

    const asset = result.assets[0];
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    if (!fileInfo.exists) {
      throw new Error('Selected image file not found');
    }

    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      size: fileInfo.size || 0,
      base64: asset.base64,
      filename: this.generateFilename(),
    };
  }

  async saveToDeviceGallery(uri: string): Promise<string> {
    // Check media library permission
    const hasPermission = await PermissionManager.checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await PermissionManager.requestMediaLibraryPermission();
      if (!granted) {
        throw new Error('Media library permission is required to save images');
      }
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      return asset.uri;
    } catch (error) {
      console.error('Failed to save to gallery:', error);
      throw new Error('Failed to save image to gallery');
    }
  }

  async copyToAppDirectory(uri: string, filename?: string): Promise<string> {
    const documentsDir = FileSystem.documentDirectory + 'documents/';
    
    // Ensure documents directory exists
    const dirInfo = await FileSystem.getInfoAsync(documentsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
    }

    const finalFilename = filename || this.generateFilename();
    const destUri = documentsDir + finalFilename;

    try {
      await FileSystem.copyAsync({
        from: uri,
        to: destUri,
      });
      return destUri;
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw new Error('Failed to copy image to app directory');
    }
  }

  async getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
    return await FileSystem.getInfoAsync(uri);
  }

  async deleteFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async convertToBase64(uri: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error('Failed to convert to base64:', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  private generateFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `document_${timestamp}.jpg`;
  }

  async validateImageFile(uri: string, maxSize?: number): Promise<{
    valid: boolean;
    error?: string;
    size?: number;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        return { valid: false, error: 'File does not exist' };
      }

      const size = fileInfo.size || 0;
      const maxAllowedSize = maxSize || platformConfig.storage.maxFileSize;

      if (size > maxAllowedSize) {
        return { 
          valid: false, 
          error: `File size (${Math.round(size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxAllowedSize / 1024 / 1024)}MB)`,
          size 
        };
      }

      return { valid: true, size };
    } catch (error) {
      console.error('File validation error:', error);
      return { valid: false, error: 'Failed to validate file' };
    }
  }
}

export const cameraService = CameraService.getInstance();
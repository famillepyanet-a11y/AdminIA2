// Re-export shared types with mobile-specific extensions
export * from '@shared/schema';

// Mobile-specific API types
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface CameraResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  type: 'image';
}

export interface DocumentPickerResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

// Extend the base Document type with mobile-specific properties
export interface MobileDocument extends Document {
  localUri?: string; // Local file URI for offline access
  uploadProgress?: number; // Upload progress for pending uploads
  isLocalOnly?: boolean; // Whether the document exists only locally
}

// Mobile app configuration
export interface AppConfig {
  apiBaseUrl: string;
  stripePublishableKey: string;
  maxFileSize: number;
  supportedFileTypes: string[];
  cameraSettings: {
    quality: number;
    allowsEditing: boolean;
    aspect: [number, number];
  };
}

// Error types for mobile-specific errors
export interface MobileError extends Error {
  code?: string;
  userInfo?: Record<string, any>;
}

export class CameraError extends Error implements MobileError {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CameraError';
  }
}

export class StorageError extends Error implements MobileError {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class NetworkError extends Error implements MobileError {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}
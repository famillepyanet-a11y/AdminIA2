import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

// Permission management utilities
export class PermissionManager {
  // Camera permissions
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  static async checkCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }

  // Media library permissions
  static async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  static async checkMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return false;
    }
  }

  // Show permission denied alert
  static showPermissionDeniedAlert(permissionType: string, onRetry?: () => void) {
    Alert.alert(
      'Permission Required',
      `${permissionType} permission is required to use this feature. Please enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: onRetry },
      ]
    );
  }

  // Request all required permissions
  static async requestAllPermissions(): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
  }> {
    const [camera, mediaLibrary] = await Promise.all([
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission(),
    ]);

    return { camera, mediaLibrary };
  }

  // Check if all required permissions are granted
  static async checkAllPermissions(): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
    allGranted: boolean;
  }> {
    const [camera, mediaLibrary] = await Promise.all([
      this.checkCameraPermission(),
      this.checkMediaLibraryPermission(),
    ]);

    return {
      camera,
      mediaLibrary,
      allGranted: camera && mediaLibrary,
    };
  }
}
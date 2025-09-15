import { Platform, Dimensions } from 'react-native';

// Platform and device utilities
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Get device dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const getScreenSize = () => {
  const { width } = getScreenDimensions();
  
  if (width < 480) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};

// Safe area utilities
export const getStatusBarHeight = () => {
  if (isIOS) {
    return 44; // Standard iOS status bar height
  }
  return 24; // Standard Android status bar height
};

// Platform-specific configurations
export const platformConfig = {
  camera: {
    quality: isIOS ? 0.8 : 0.7, // iOS can handle higher quality
    allowsEditing: true,
    aspect: [4, 3] as [number, number],
  },
  
  navigation: {
    gestureEnabled: isIOS, // iOS has better gesture support
    animationEnabled: true,
  },
  
  storage: {
    maxFileSize: isIOS ? 50 * 1024 * 1024 : 30 * 1024 * 1024, // 50MB on iOS, 30MB on Android
  },
  
  ui: {
    hapticFeedback: isIOS, // iOS has better haptic feedback
    statusBarStyle: isIOS ? 'dark-content' : 'light-content',
  },
} as const;

// Version checking utilities
export const getAppVersion = () => {
  // This would typically come from app.json or package.json
  return '1.0.0';
};

export const getPlatformVersion = () => {
  return Platform.Version;
};
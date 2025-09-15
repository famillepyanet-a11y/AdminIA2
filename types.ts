import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Define navigation param lists
export type RootStackParamList = {
  AuthStack: undefined;
  MainTab: undefined;
  DocumentDetail: { documentId: string };
  CameraStack: undefined;
  PricingStack: undefined;
  SubscriptionStack: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Documents: undefined;
  Scan: undefined;
  Settings: undefined;
};

export type CameraStackParamList = {
  CameraView: undefined;
  CameraPreview: { imageUri: string };
};

export type PricingStackParamList = {
  Pricing: undefined;
  SubscriptionSuccess: undefined;
};

export type SubscriptionStackParamList = {
  Subscription: undefined;
  SubscriptionManagement: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type CameraStackScreenProps<T extends keyof CameraStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<CameraStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
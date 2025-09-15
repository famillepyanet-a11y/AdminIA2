import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import { CameraStack } from './CameraStack';
import { DocumentDetailScreen } from '@/screens/DocumentDetailScreen';
import { PricingScreen } from '@/screens/PricingScreen';
import { SubscriptionScreen } from '@/screens/SubscriptionScreen';
import { LoadingScreen } from '@/screens/LoadingScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth stack for non-authenticated users
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          // Main app stack for authenticated users
          <>
            <Stack.Screen name="MainTab" component={MainTabNavigator} />
            <Stack.Screen 
              name="DocumentDetail" 
              component={DocumentDetailScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="CameraStack" 
              component={CameraStack}
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="PricingStack" 
              component={PricingScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="SubscriptionStack" 
              component={SubscriptionScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
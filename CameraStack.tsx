import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CameraScreen } from '@/screens/CameraScreen';
import { CameraPreviewScreen } from '@/screens/CameraPreviewScreen';
import type { CameraStackParamList } from './types';

const Stack = createNativeStackNavigator<CameraStackParamList>();

export function CameraStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'fullScreenModal',
      }}
    >
      <Stack.Screen name="CameraView" component={CameraScreen} />
      <Stack.Screen 
        name="CameraPreview" 
        component={CameraPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
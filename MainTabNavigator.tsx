import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { DocumentsScreen } from '@/screens/DocumentsScreen';
import { ScanScreen } from '@/screens/ScanScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { colors } from '@/constants/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Documents':
              iconName = 'folder';
              break;
            case 'Scan':
              iconName = 'camera-alt';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: t('mobile.home'),
        }}
      />
      <Tab.Screen 
        name="Documents" 
        component={DocumentsScreen}
        options={{
          tabBarLabel: t('mobile.documents'),
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{
          tabBarLabel: t('mobile.scan'),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: t('mobile.settings'),
        }}
      />
    </Tab.Navigator>
  );
}
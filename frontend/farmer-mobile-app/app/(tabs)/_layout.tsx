import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/context/LanguageContext'; // 1. IMPORT THE HOOK

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { t } = useTranslation(); // 2. USE THE HOOK TO GET THE 't' FUNCTION

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false, 
      }}>
      <Tabs.Screen
        name="index" // This corresponds to app/(tabs)/index.tsx
        options={{
          title: t('tabs.home'), // 3. USE TRANSLATION
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tractor" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings" // This corresponds to app/(tabs)/bookings.tsx
        options={{
          title: t('tabs.bookings'), // 4. USE TRANSLATION
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet" // This corresponds to app/(tabs)/wallet.tsx
        options={{
          title: t('tabs.wallet'), // 5. USE TRANSLATION
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // This corresponds to app/(tabs)/profile.tsx
        options={{
          title: t('tabs.profile'), // 6. USE TRANSLATION
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
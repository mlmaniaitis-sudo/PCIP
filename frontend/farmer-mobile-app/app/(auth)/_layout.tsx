import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from '@/context/LanguageContext'; // 1. Import hook

export default function AuthLayout() {
  const { t } = useTranslation(); // 2. Use hook

  return (
    <Stack>
      {/* 3. Translate titles */}
      <Stack.Screen name="login" options={{ title: t('login.title') }} /> 
      <Stack.Screen name="verify" options={{ title: t('verify.title') }} /> 
    </Stack>
  );
}
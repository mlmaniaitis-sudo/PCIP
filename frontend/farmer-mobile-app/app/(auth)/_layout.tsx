import React from 'react';
import { Stack } from 'expo-router';

// This is the layout for the (auth) group of screens
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="verify" options={{ title: 'Verify Code' }} />
    </Stack>
  );
}
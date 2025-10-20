// frontend/farmer-mobile-app/app/(tabs)/profile.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
  const { signOut, session } = useAuth(); // Get signOut and session

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText type="subtitle">
        Logged in as: {String(session.user?.phone_number ?? null)}
      </ThemedText>
      <ThemedText>
        User ID: {String(session.user?.user_id ?? null)}
      </ThemedText>
      <ThemedText>
        Role: {String(session.user?.role ?? null)}
      </ThemedText>
      
      {/* Add other profile info/links here later */}

      <Button
        mode="contained"
        onPress={signOut} // Call the signOut function from context
        style={styles.button}>
        Sign Out
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    marginTop: 24,
    width: '80%',
  },
});
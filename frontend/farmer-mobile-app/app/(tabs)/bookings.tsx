import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function BookingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">My Bookings</ThemedText>
      <ThemedText>This screen will show a list of past and upcoming bookings.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

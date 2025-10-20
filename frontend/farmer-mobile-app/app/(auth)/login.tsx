// frontend/farmer-mobile-app/app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import apiClient from '@/api/client';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      // Call the backend API
      const response = await apiClient.post('/auth/otp/send', {
        phone_number: phoneNumber,
      });

      if (response.data.success) {
        Alert.alert('Success', 'OTP sent to your phone!');
        // Navigate to the verify screen, passing the phone number
        router.push({
          pathname: '/verify',
          params: { phone_number: phoneNumber },
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error.response?.data || error.message);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, Farmer!
      </Text>
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        placeholder="+91xxxxxxxxxx"
      />
      <Button
        mode="contained"
        onPress={handleSendOTP}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        Send OTP
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
  },
});
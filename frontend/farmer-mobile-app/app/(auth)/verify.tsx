// frontend/farmer-mobile-app/app/(auth)/verify.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function VerifyOTPScreen() {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const { signIn } = useAuth(); // Get the signIn function from context

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      // Call the backend API
      const response = await apiClient.post('/auth/otp/verify', {
        phone_number: phone_number,
        otp_code: otpCode,
      });

      if (response.data.access_token) {
        // SUCCESS!
        // Use the signIn function from context to store token and user
        signIn(response.data.access_token, response.data.user);
        // The RootLayout will automatically redirect to the (tabs) group
      } else {
        Alert.alert('Error', 'Invalid OTP or an error occurred.');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Enter Verification Code
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sent to {phone_number}
      </Text>
      <TextInput
        label="OTP Code"
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        Verify and Log In
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
    marginBottom: 8,
  },
  subtitle: {
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
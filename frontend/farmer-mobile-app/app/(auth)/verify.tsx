import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext'; 
import { useTranslation } from '@/context/LanguageContext'; // 1. Import hook

export default function VerifyOTPScreen() {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const { signIn } = useAuth(); 
  const { t } = useTranslation(); // 2. Use hook

  const handleVerifyOTP = async () => {
    // ... (keep existing logic, including Alert messages)
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/otp/verify', {
        phone_number: phone_number,
        otp_code: otpCode,
      });
      if (response.data.access_token) {
        signIn(response.data.access_token, response.data.user);
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
      {/* 3. Translate UI Text */}
      <Text variant="headlineMedium" style={styles.title}>
        {t('verify.title')} 
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {t('verify.subtitle')} {phone_number} 
      </Text>
      <TextInput
        // label={t('verify.otpLabel')} // Can add a label key if needed
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        mode="outlined"
        placeholder="------" // Placeholder for OTP
      />
      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        {t('verify.verifyOtp')} 
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
    color: '#666', 
  },
  input: {
    marginBottom: 16,
    textAlign: 'center', // Center OTP input text
  },
  button: {
    paddingVertical: 8,
  },
});
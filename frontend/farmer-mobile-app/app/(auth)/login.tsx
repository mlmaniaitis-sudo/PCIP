import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import apiClient from '@/api/client';
import { useTranslation } from '@/context/LanguageContext'; // 1. Import hook

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation(); // 2. Use hook

  const handleSendOTP = async () => {
    // ... (keep existing logic, including Alert messages - Alert uses native OS language)
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/otp/send', {
        phone_number: phoneNumber,
      });
      if (response.data.success) {
        Alert.alert('Success', 'OTP sent to your phone!');
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
      {/* 3. Translate UI text */}
      <Text variant="headlineMedium" style={styles.title}>
        {t('login.title')} 
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {t('login.subtitle')} 
      </Text>
      <TextInput
        // label={t('login.placeholder')} // Label can be translated too
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        placeholder={t('login.placeholder')} // Translate placeholder
      />
      <Button
        mode="contained"
        onPress={handleSendOTP}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        {t('login.sendOtp')} 
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
    marginBottom: 8, // Reduced margin
  },
  subtitle: { // Added style for subtitle
    textAlign: 'center',
    marginBottom: 24,
    color: '#666', // Slightly muted color
  },
  input: {
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
  },
});
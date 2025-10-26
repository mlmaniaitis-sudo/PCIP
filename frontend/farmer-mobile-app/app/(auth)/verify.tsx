// frontend/farmer-mobile-app/app/verify.tsx
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function VerifyOTPScreen() {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleVerifyOTP = async () => {
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

  const handleResendOTP = async () => {
    Alert.alert('Success', 'OTP has been resent to your phone!');
    // Add actual resend logic here if needed
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View style={styles.backButton}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#2E7D32" 
            onPress={() => router.back()}
          />
        </View>

        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="message-text" size={50} color="#2E7D32" />
          </View>
        </View>

        {/* Verify Card */}
        <View style={styles.verifyCard}>
          <Text style={styles.title}>{t('verify.title')}</Text>
          <Text style={styles.subtitle}>
            {t('verify.subtitle')} {'\n'}
            <Text style={styles.phoneNumber}>{phone_number}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              mode="outlined"
              placeholder="● ● ● ● ● ●"
              outlineColor="#E0E0E0"
              activeOutlineColor="#2E7D32"
              textColor="#212121"
              placeholderTextColor="#BDBDBD"
              contentStyle={styles.inputContent}
            />
            <Text style={styles.otpHint}>{t('verify.otpHint')}</Text>
          </View>

          {/* Verify Button */}
          <Button
            mode="contained"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={loading}
            buttonColor="#2E7D32"
            textColor="#FFFFFF"
            style={styles.button}
            labelStyle={styles.buttonLabel}
            icon="check-circle"
            contentStyle={styles.buttonContent}
          >
            {t('verify.verifyOtp')}
          </Button>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{t('verify.didntReceive')}</Text>
            <Button
              mode="text"
              onPress={handleResendOTP}
              textColor="#2E7D32"
              labelStyle={styles.resendButton}
            >
              {t('verify.resendOtp')}
            </Button>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <MaterialCommunityIcons name="shield-lock" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>{t('verify.secureVerification')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  phoneNumber: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 24,
  },
  inputContent: {
    textAlign: 'center',
    letterSpacing: 8,
  },
  otpHint: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#757575',
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 6,
  },
});

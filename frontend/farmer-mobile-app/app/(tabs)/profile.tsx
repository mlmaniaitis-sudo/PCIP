// frontend/farmer-mobile-app/app/(tabs)/profile.tsx
import { ThemedView } from '@/components/themed-view';
import { MOCK_PARCELS, MOCK_PROFILE } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text } from 'react-native-paper';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export default function ProfileScreen() {
  const { signOut, session } = useAuth();
  const { setLocale, locale, t } = useTranslation();
  const profile = MOCK_PROFILE;
  const parcels = MOCK_PARCELS;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Icon 
                size={100} 
                icon="account" 
                style={styles.avatar}
                color="#FFFFFF"
              />
              <View style={styles.avatarBadge}>
                <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
              </View>
            </View>
            <Text style={styles.headerTitle}>{t('profile.farmer')}</Text>
            <Text style={styles.headerPhone}>
              {session?.user?.phone_number || '+91 XXXXXXXXXX'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-details" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>{t('profile.myDetails')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="identifier" size={20} color="#757575" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('profile.pmKisanId')}</Text>
              <Text style={styles.detailValue}>{profile.pm_kisan_id}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="home-city-outline" size={20} color="#757575" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('profile.village')}</Text>
              <Text style={styles.detailValue}>{profile.village}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color="#757575" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('profile.district')}</Text>
              <Text style={styles.detailValue}>{profile.district}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="map-legend" size={20} color="#757575" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('profile.state')}</Text>
              <Text style={styles.detailValue}>{profile.state}</Text>
            </View>
          </View>
        </View>

        {/* Parcels Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>{t('profile.myParcels')}</Text>
          </View>
          
          {parcels.length > 0 ? (
            parcels.map((parcel, index) => (
              <React.Fragment key={parcel.parcel_id}>
                {index > 0 && <Divider style={styles.divider} />}
                <Pressable 
                  style={styles.parcelItem}
                  onPress={() => Alert.alert(
                    t('profile.viewParcel'), 
                    `${t('profile.viewParcelMsg')} ...${parcel.parcel_id.slice(-6)}`
                  )}
                >
                  <View style={styles.parcelIcon}>
                    <MaterialCommunityIcons name="map-marker-outline" size={24} color="#2E7D32" />
                  </View>
                  <View style={styles.parcelContent}>
                    <Text style={styles.parcelTitle}>
                      {t('profile.parcelId')}: ...{parcel.parcel_id.slice(-6)}
                    </Text>
                    <Text style={styles.parcelDetails}>
                      {t('profile.crop')}: {parcel.crop} • {parcel.area_hectares} {t('profile.hectares')}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
                </Pressable>
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.noParcelsText}>{t('profile.noParcels')}</Text>
          )}
          
          <Button 
            icon="plus-circle-outline" 
            mode="contained"
            buttonColor="#E8F5E9"
            textColor="#2E7D32"
            onPress={() => Alert.alert(t('profile.addParcel'), t('profile.addParcelPlaceholder'))} 
            style={styles.addParcelButton}
          >
            {t('profile.addParcel')}
          </Button>
        </View>

        {/* Language Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="translate" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>{t('profile.language')}</Text>
          </View>
          
          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={[
                  styles.languageButton,
                  locale === lang.code && styles.languageButtonActive
                ]}
                onPress={() => setLocale(lang.code)}
              >
                <Text style={[
                  styles.languageButtonText,
                  locale === lang.code && styles.languageButtonTextActive
                ]}>
                  {lang.nativeName}
                </Text>
                {locale === lang.code && (
                  <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out Button */}
        <Button
          mode="contained"
          icon="logout"
          onPress={signOut}
          buttonColor="#EF5350"
          textColor="#FFFFFF"
          style={styles.signOutButton}
          labelStyle={styles.signOutLabel}
        >
          {t('profile.signOut')}
        </Button>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    height: 200,
    position: 'relative',
    marginBottom: 60,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#1B5E20',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  divider: {
    backgroundColor: '#F5F5F5',
  },
  parcelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  parcelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  parcelContent: {
    flex: 1,
  },
  parcelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  parcelDetails: {
    fontSize: 13,
    color: '#757575',
  },
  noParcelsText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
    paddingVertical: 20,
  },
  addParcelButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    minWidth: 100,
  },
  languageButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginRight: 6,
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 4,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, List, Divider, Avatar } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTranslation } from '@/context/LanguageContext'; // 1. Import translation hook
import { MOCK_PROFILE, MOCK_PARCELS } from '@/constants/mockData'; // 2. Import mock data

export default function ProfileScreen() {
  const { signOut, session } = useAuth();
  const { setLocale, locale, t } = useTranslation(); // 3. Use translation hook

  const profile = MOCK_PROFILE; // Use mock data
  const parcels = MOCK_PARCELS; // Use mock data

  return (
    <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
        
        {/* Profile Header */}
        <View style={styles.header}>
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
            <ThemedText type="title" style={styles.title}>{t('tabs.profile')}</ThemedText>
            <Text style={styles.phoneText}>
            {t('profile.loggedInAs')}: {String(session?.user?.phone_number ?? 'N/A')}
            </Text>
        </View>

        {/* My Details Section */}
        <List.Section style={styles.section}>
            <List.Subheader>{t('profile.myDetails')}</List.Subheader>
            <List.Item
                title={t('profile.pmKisanId')}
                description={profile.pm_kisan_id}
                left={() => <List.Icon icon="identifier" />}
            />
            <Divider />
            <List.Item
                title={t('profile.village')}
                description={profile.village}
                left={() => <List.Icon icon="home-city-outline" />}
            />
             <Divider />
            <List.Item
                title={t('profile.district')}
                description={profile.district}
                left={() => <List.Icon icon="map-marker-radius-outline" />}
            />
             <Divider />
             <List.Item
                title={t('profile.state')}
                description={profile.state}
                left={() => <List.Icon icon="map-legend" />}
            />
             {/* Add Edit Button Placeholder if needed */}
             {/* <Button mode="outlined" onPress={() => {}} style={styles.editButton}>Edit Details</Button> */}
        </List.Section>

        {/* My Parcels Section */}
        <List.Section style={styles.section}>
            <List.Subheader>{t('profile.myParcels')}</List.Subheader>
            {parcels.length > 0 ? (
                parcels.map((parcel) => (
                    <React.Fragment key={parcel.parcel_id}>
                        <List.Item
                            title={`${t('profile.parcelId')}: ...${parcel.parcel_id.slice(-6)}`}
                            description={`${t('profile.crop')}: ${parcel.crop} | ${t('profile.area')}: ${parcel.area_hectares}`}
                            left={() => <List.Icon icon="map-marker-outline" />}
                            // Add onPress to navigate to parcel details/edit later
                            onPress={() => Alert.alert("View Parcel", `Placeholder for viewing Parcel ...${parcel.parcel_id.slice(-6)}`)}
                        />
                         <Divider />
                    </React.Fragment>
                ))
            ) : (
                <Text style={styles.noParcelsText}>No parcels added yet.</Text>
            )}
             <Button 
                icon="plus-circle-outline" 
                mode="contained-tonal" 
                onPress={() => Alert.alert(t('profile.addParcel'), t('profile.addParcelPlaceholder'))} 
                style={styles.addParcelButton}
            >
                {t('profile.addParcel')}
            </Button>
        </List.Section>

        {/* Language Switcher Section */}
        <List.Section style={styles.section}>
            <List.Subheader>{t('profile.language')} / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ / భాషను ఎంచుకోండి / மொழியை தேர்ந்தெடுங்கள்</List.Subheader>
            <View style={styles.languageButtonsContainer}>
                <Button mode={locale === 'en' ? 'contained' : 'outlined'} onPress={() => setLocale('en')}>English</Button>
                <Button mode={locale === 'hi' ? 'contained' : 'outlined'} onPress={() => setLocale('hi')}>हिंदी</Button>
                <Button mode={locale === 'pa' ? 'contained' : 'outlined'} onPress={() => setLocale('pa')}>ਪੰਜਾਬੀ</Button>
                <Button mode={locale === 'te' ? 'contained' : 'outlined'} onPress={() => setLocale('te')}>తెలుగు</Button>
                <Button mode={locale === 'ta' ? 'contained' : 'outlined'} onPress={() => setLocale('ta')}>தமிழ்</Button>
            </View>
        </List.Section>

        {/* Sign Out Button */}
        <Button
            mode="contained"
            icon="logout"
            onPress={signOut}
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
    },
    container: {
        flex: 1,
        paddingBottom: 30, // Space at the bottom
    },
    header: {
        alignItems: 'center',
        paddingTop: 50, // Status bar height
        paddingBottom: 20,
        backgroundColor: '#E6F4FE', // Light blue background
        marginBottom: 10,
    },
    avatar: {
        marginBottom: 10,
        backgroundColor: '#6750A4', // Theme color
    },
    title: {
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 16,
        color: '#555',
    },
    section: {
        marginTop: 10,
        marginHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 1, // Android shadow
    },
    noParcelsText: {
        padding: 15,
        textAlign: 'center',
        color: '#888',
    },
    addParcelButton: {
        margin: 15,
    },
    languageButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
        justifyContent: 'center',
        padding: 10,
        gap: 10, // Spacing between buttons
    },
    signOutButton: {
        marginTop: 30,
        marginHorizontal: 40, // Center it a bit
        paddingVertical: 8,
        borderRadius: 20, // More rounded corners
    },
    signOutLabel: {
        fontSize: 16,
    }
});
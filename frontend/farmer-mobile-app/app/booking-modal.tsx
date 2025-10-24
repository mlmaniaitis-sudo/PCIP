import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button, RadioButton, Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTranslation } from '@/context/LanguageContext'; // 1. Import hook
import { MOCK_PARCELS } from '@/constants/mockData'; // 2. Import mock parcels

export default function BookingModal() {
    const { machineId, machineType } = useLocalSearchParams<{ machineId: string, machineType: string }>();
    const router = useRouter();
    const { t } = useTranslation(); // 3. Use hook

    const [parcels, setParcels] = useState(MOCK_PARCELS); // 4. Use mock data
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

    const handleConfirmBooking = () => {
        if (!selectedParcelId) {
            Alert.alert(t('bookingModal.alertSelectionTitle'), t('bookingModal.alertSelectionMessage'));
            return;
        }
        // Mock confirmation
        const parcelIdShort = selectedParcelId.slice(-6); // Get last 6 chars for display
        Alert.alert(
            t('bookingModal.alertConfirmTitle'),
            t('bookingModal.alertConfirmMessage', { machineType, parcelIdShort }),
            [{ text: t('bookingModal.alertOK'), onPress: () => router.back() }] // Use translated OK button
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ThemedView style={styles.container}>
                <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={64} 
                    color="#6750A4" // Theme color
                    style={styles.icon} 
                />
                <ThemedText type="title">{t('bookingModal.title')}</ThemedText>
                <Text style={styles.text}>{t('bookingModal.aboutToBook')}</Text>
                <Text variant="headlineMedium" style={styles.machineType}>{machineType}</Text>
                <Text style={styles.machineIdText}>{t('bookingModal.machineId')}: {machineId}</Text>
                
                <Divider style={styles.divider} />

                {/* Parcel Selector */}
                <Text style={styles.parcelTitle}>{t('bookingModal.selectParcel')}</Text>
                <RadioButton.Group onValueChange={newValue => setSelectedParcelId(newValue)} value={selectedParcelId || ''}>
                    {parcels.map((parcel) => (
                        <View key={parcel.parcel_id} style={styles.radioItem}>
                            <RadioButton value={parcel.parcel_id} />
                            <Text style={styles.radioLabel}>
                                {`${t('profile.parcelId')}: ...${parcel.parcel_id.slice(-6)} (${parcel.crop}, ${parcel.area_hectares}ha)`}
                            </Text>
                        </View>
                    ))}
                </RadioButton.Group>

                {parcels.length === 0 && (
                     <Text style={styles.noParcelsText}>No parcels found. Add one in your Profile.</Text>
                )}


                <Button 
                    mode="contained" 
                    onPress={handleConfirmBooking} 
                    style={styles.button}
                    disabled={!selectedParcelId} // Disable if no parcel selected
                    icon="check-circle-outline"
                >
                    {t('bookingModal.confirmRequest')}
                </Button>
                {router.canGoBack() && (
                    <Button onPress={() => router.back()} style={styles.button} icon="arrow-left-circle-outline">
                        {t('bookingModal.goBack')}
                    </Button>
                )}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1, // Allows content to take full height if needed
        justifyContent: 'center', // Center content vertically
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    icon: {
        marginBottom: 15,
    },
    text: {
        marginBottom: 8,
        fontSize: 16,
    },
     machineIdText: {
        marginBottom: 8,
        fontSize: 14,
        color: '#666',
    },
    machineType: {
        marginBottom: 5, // Reduced margin
        fontWeight: 'bold',
        color: '#6750A4', // Theme color
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '90%',
        marginVertical: 25,
    },
    parcelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        alignSelf: 'flex-start', // Align left
        marginLeft: '5%', // Indent slightly
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '90%', // Ensure it fits
    },
    radioLabel: {
        marginLeft: 8,
        flexShrink: 1, // Allow text to wrap if needed
    },
    noParcelsText: {
        fontStyle: 'italic',
        color: '#888',
        marginVertical: 10,
    },
    button: {
        width: '90%',
        marginTop: 15, // Increased spacing
        paddingVertical: 5,
    }}
);
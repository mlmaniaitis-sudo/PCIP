import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from 'react-native-paper';

// This screen is presented as a modal because its name is not in a group like (tabs)

export default function BookingModal() {
    const { machineId, machineType } = useLocalSearchParams<{ machineId: string, machineType: string }>();
    const router = useRouter();

    const handleConfirmBooking = () => {
        // Here you would:
        // 1. Let the user select a parcel (fetch from GET /farmer/parcels/my)
        // 2. Call the POST /farmer/bookings endpoint
        Alert.alert(
            "Booking Confirmation",
            `This will request a booking for a ${machineType}. Parcel selection and final confirmation will be implemented next.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => router.back() }
            ]
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Book Machine</ThemedText>
            <ThemedText style={styles.text}>You are about to book a:</ThemedText>
            <ThemedText type="subtitle" style={styles.machineType}>{machineType}</ThemedText>
            <ThemedText style={styles.text}>Machine ID: {machineId}</ThemedText>
            
            {/* Placeholder for Parcel Selector */}
            <View style={styles.placeholder}>
                 <ThemedText>Parcel Selector will go here.</ThemedText>
            </View>

            <Button mode="contained" onPress={handleConfirmBooking} style={styles.button}>
                Confirm Booking Request
            </Button>
            {router.canGoBack() && (
                 <Button onPress={() => router.back()} style={styles.button}>
                    Go Back
                 </Button>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        marginBottom: 8,
    },
    machineType: {
        marginBottom: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        padding: 20,
        marginVertical: 20,
        width: '90%',
        alignItems: 'center',
    },
    button: {
        width: '90%',
        marginTop: 10,
    }
});

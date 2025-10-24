import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTranslation } from '@/context/LanguageContext'; // 1. Import translation hook
import { MOCK_BOOKINGS } from '@/constants/mockData'; // 2. Import mock data and type
import { Booking, BookingStatus } from '@/types';

// Helper function to get status color
const getStatusChipColor = (status: BookingStatus) => {
  switch (status) {
    case 'completed': return '#4CAF50'; // Green
    case 'accepted': return '#2196F3'; // Blue
    case 'in_progress': return '#FF9800'; // Orange
    case 'pending': return '#FFC107'; // Amber
    case 'cancelled': return '#F44336'; // Red
    default: return '#9E9E9E'; // Grey
  }
};

// Helper function to get translated status text
const getTranslatedStatus = (status: BookingStatus, t: Function): string => {
    switch (status) {
        case 'completed': return t('bookings.completed');
        case 'accepted': return t('bookings.accepted');
        case 'in_progress': return t('bookings.inProgress');
        case 'pending': return t('bookings.pending');
        case 'cancelled': return t('bookings.cancelled');
        default: return status;
    }
}

export default function BookingsScreen() {
  const { t } = useTranslation(); // 3. Use the hook
  const [loading, setLoading] = React.useState(false); // Can simulate loading if needed
  const [bookings, setBookings] = React.useState<Booking[]>(MOCK_BOOKINGS); // 4. Use mock data

  // Function to format dates nicely (can be moved to a utils file)
  const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    try {
      // Use device locale for formatting
      return new Date(isoString).toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) {
      return isoString; // Fallback if date is invalid
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.machine_type_requested}
        subtitle={`${t('bookings.parcelId')}: ...${item.parcel_id.slice(-6)}`}
        left={(props) => (
            <MaterialCommunityIcons 
                {...props} 
                name={ item.machine_type_requested === 'Baler' ? 'package-variant-closed' : 
                        item.machine_type_requested === 'Rotavator' ? 'fan' :
                        item.machine_type_requested === 'Harvester' ? 'tractor-variant' : // Or specific harvester icon
                        'tractor' // Default tractor
                      } 
                size={24} 
            />
        )}
        right={(props) => (
            <Chip 
                {...props}
                style={[styles.chip, { backgroundColor: getStatusChipColor(item.status) }]}
                textStyle={styles.chipText}
            >
                {getTranslatedStatus(item.status, t)}
            </Chip>
        )}
      />
      <Card.Content>
         <Text variant="bodyMedium">{t('bookings.requested')}: {formatDate(item.created_at)}</Text>
         {item.scheduled_time && <Text variant="bodyMedium">{t('bookings.scheduled')}: {formatDate(item.scheduled_time)}</Text>}
         {item.completed_time && <Text variant="bodyMedium">{t('bookings.completed')}: {formatDate(item.completed_time)}</Text>}
         {item.final_amount && <Text variant="titleMedium" style={{marginTop: 5}}>₹ {item.final_amount.toFixed(2)}</Text>}
      </Card.Content>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>{t('tabs.bookings')}</ThemedText> 
      
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.booking_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
             <View style={styles.emptyContainer}>
                 <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#cccccc" />
                 <Text style={styles.emptyText}>{t('bookings.noBookings')}</Text>
             </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Remove alignItems and justifyContent to allow list to fill screen
  },
  title: {
      paddingHorizontal: 16,
      paddingTop: 50, // Adjust for status bar
      paddingBottom: 10,
      fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 8,
    backgroundColor: 'white', // Ensure cards are visible on themed background
  },
  chip: {
    marginRight: 16, // Add margin for spacing
  },
  chipText: {
      color: 'white',
      fontWeight: 'bold',
  },
  loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 100, // Push down from top
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
});
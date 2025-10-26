// frontend/farmer-mobile-app/app/(tabs)/bookings.tsx
import { ThemedView } from '@/components/themed-view';
import { MOCK_BOOKINGS } from '@/constants/mockData';
import { useTranslation } from '@/context/LanguageContext';
import { Booking, BookingStatus } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, SegmentedButtons, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

// Helper function to get status color
const getStatusConfig = (status: BookingStatus) => {
  switch (status) {
    case 'completed': 
      return { color: '#4CAF50', icon: 'check-circle', bg: '#E8F5E9' };
    case 'accepted': 
      return { color: '#2196F3', icon: 'clock-check', bg: '#E3F2FD' };
    case 'in_progress': 
      return { color: '#FF9800', icon: 'progress-clock', bg: '#FFF3E0' };
    case 'pending': 
      return { color: '#FFC107', icon: 'clock-alert', bg: '#FFF9C4' };
    case 'cancelled': 
      return { color: '#F44336', icon: 'close-circle', bg: '#FFEBEE' };
    default: 
      return { color: '#9E9E9E', icon: 'help-circle', bg: '#F5F5F5' };
  }
};

// Helper function to get machine icon
const getMachineIcon = (machineType: string) => {
  switch (machineType) {
    case 'Baler': return 'package-variant-closed';
    case 'Rotavator': return 'fan';
    case 'Harvester': return 'grain';
    case 'Tractor': return 'tractor';
    default: return 'tools';
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
};

export default function BookingsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Format dates nicely
  const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'accepted', 'in_progress'].includes(booking.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(booking.status);
    return true;
  });

  // Simulate live tracking for "in_progress" bookings
  const handleTrackMachine = (bookingId: string) => {
    alert(t('bookings.liveTrackingTitle') + '\n\n' + t('bookings.liveTrackingMsg'));
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusConfig = getStatusConfig(item.status);
    const isActive = ['pending', 'accepted', 'in_progress'].includes(item.status);

    return (
      <Pressable 
        style={styles.bookingCard}
        onPress={() => item.status === 'in_progress' && handleTrackMachine(item.booking_id)}
      >
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingHeaderLeft}>
            <View style={[styles.machineIcon, { backgroundColor: statusConfig.bg }]}>
              <MaterialCommunityIcons 
                name={getMachineIcon(item.machine_type_requested)} 
                size={24} 
                color={statusConfig.color}
              />
            </View>
            <View style={styles.bookingHeaderText}>
              <Text style={styles.machineName}>{item.machine_type_requested}</Text>
              <Text style={styles.bookingId}>ID: #{item.booking_id.slice(-8)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <MaterialCommunityIcons 
              // name={statusConfig.icon} 
              size={16} 
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {getTranslatedStatus(item.status, t)}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
            <Text style={styles.detailText}>
              {t('bookings.booked')}: {formatDate(item.created_at)}
            </Text>
          </View>
          
          {item.scheduled_time && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#757575" />
              <Text style={styles.detailText}>
                {t('bookings.scheduled')}: {formatDate(item.scheduled_time)}
              </Text>
            </View>
          )}
          
          {item.completed_time && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.detailText}>
                {t('bookings.completedOn')}: {formatDate(item.completed_time)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.bookingFooter}>
          {item.final_amount && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>{t('bookings.amountPaid')}</Text>
              <Text style={styles.amount}>₹{item.final_amount.toFixed(0)}</Text>
            </View>
          )}
          
          {item.status === 'in_progress' && (
            <View style={styles.trackingButton}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color="#2E7D32" />
              <Text style={styles.trackingText}>{t('bookings.trackLive')}</Text>
            </View>
          )}
          
          {item.status === 'completed' && (
            <View style={styles.creditsEarned}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.creditsText}>+50 {t('bookings.creditsEarned')}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>{t('bookings.your')}</Text>
            <Text style={styles.headerTitle}>{t('bookings.bookings')}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{filteredBookings.length}</Text>
          </View>
        </View>
        
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filter}
            onValueChange={(value) => setFilter(value as any)}
            buttons={[
              { 
                value: 'all', 
                label: t('bookings.all'),
                checkedColor: '#FFFFFF',
                uncheckedColor: '#2E7D32',
                style: filter === 'all' ? styles.filterActive : styles.filterInactive
              },
              { 
                value: 'active', 
                label: t('bookings.active'),
                checkedColor: '#FFFFFF',
                uncheckedColor: '#2E7D32',
                style: filter === 'active' ? styles.filterActive : styles.filterInactive
              },
              { 
                value: 'completed', 
                label: t('bookings.history'),
                checkedColor: '#FFFFFF',
                uncheckedColor: '#2E7D32',
                style: filter === 'completed' ? styles.filterActive : styles.filterInactive
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>{t('bookings.loadingBookings')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.booking_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#BDBDBD" />
              </View>
              <Text style={styles.emptyTitle}>{t('bookings.noBookingsYet')}</Text>
              <Text style={styles.emptyText}>
                {t('bookings.bookingHistoryHere')}
              </Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  filterContainer: {
    marginTop: 8,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  filterActive: {
    backgroundColor: '#2E7D32',
  },
  filterInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  machineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingHeaderText: {
    flex: 1,
  },
  machineName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    color: '#757575',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  bookingDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  trackingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 6,
  },
  creditsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
  },
  creditsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57C00',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

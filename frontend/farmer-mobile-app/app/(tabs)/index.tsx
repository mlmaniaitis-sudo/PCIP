import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Chip, FAB, IconButton, Text, SegmentedButtons } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// REMOVE: import apiClient from '@/api/client';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Machine } from '@/types'; // Import our new type

import { useTranslation } from '@/context/LanguageContext'; // 1. ADD THIS
import { MOCK_MACHINES } from '@/constants/mockData'; // 2. ADD THIS

// Example machine types, you can fetch these from an API later
const MACHINE_TYPES = ['Baler', 'Rotavator', 'Harvester', 'Tractor'];

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineType, setSelectedMachineType] = useState(MACHINE_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const router = useRouter();
  const { t } = useTranslation(); // 3. ADD THIS

  // --- Location Permission and Fetching ---
  const getLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const msg = t('home.permissionDenied'); // 4. TRANSLATE
      setErrorMsg(msg);
      Alert.alert(t('tabs.profile'), msg); // Use a translated title
      setLoading(false);
      return null;
    }

    try {
      // For testing, you can hardcode a location:
      // const currentLocation = { coords: { latitude: 28.7041, longitude: 77.1025 }, timestamp: Date.now() } as Location.LocationObject;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      const msg = t('home.locationError'); // 5. TRANSLATE
      setErrorMsg(msg);
      Alert.alert('Location Error', `${msg} ${t('home.tryAgain')}.`);
      setLoading(false);
      return null;
    }
  }, [t]); // Add 't' to dependency array

  // --- Data Fetching (MODIFIED FOR PROTOTYPE) ---
  const fetchMachines = useCallback(async (currentLocation: Location.LocationObject | null) => {
    if (!currentLocation) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      // HARDCODED DATA: Filter mock machines by type and status
      const filteredMachines = MOCK_MACHINES.filter(
        (machine) => machine.type === selectedMachineType && machine.status === 'idle'
      );
      
      // Simulate distance calculation (random for prototype)
      const machinesWithDistance = filteredMachines.map(m => ({
        ...m,
        distance_km: (Math.random() * 10) + 2 
      }));

      setMachines(machinesWithDistance);

    } catch (error: any) {
      console.error('Failed to fetch (mock) machines:', error.message);
      Alert.alert(t('home.fetchError'), t('home.tryAgain'));
    } finally {
      setLoading(false);
    }
  }, [selectedMachineType, t]); // Add 't' to dependency array

  // --- Initial Load and Refresh Logic ---
  const onRefresh = useCallback(async () => {
    const freshLocation = await getLocation();
    if (freshLocation) {
      await fetchMachines(freshLocation);
    }
  }, [getLocation, fetchMachines]);

  useEffect(() => {
    onRefresh(); // Run on initial component mount
  }, []); 

  useEffect(() => {
    if(location) { 
        fetchMachines(location);
    }
  }, [selectedMachineType, fetchMachines]); // Removed 'location' to prevent re-fetch on map move


  // --- Render Functions ---
  const renderMachineItem = ({ item }: { item: Machine }) => (
    <Link href={{ pathname: "/booking-modal", params: { machineId: item.machine_id, machineType: item.type } }} asChild>
      <Pressable>
        <Card style={styles.listItem}>
          <Card.Title
            title={item.name || item.type}
            // 6. TRANSLATE SUBTITLE
            subtitle={`${t('home.status')}: ${item.status} | ~${item.distance_km?.toFixed(1) ?? t('home.notAvailable')} ${t('home.kmAway')}`}
            left={(props) => <MaterialCommunityIcons {...props} name="tractor" size={24} color="#6750A4" />}
          />
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTopRow}>
          <ThemedText type="title">{t('home.title')}</ThemedText> 
        </View>
        <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'map' | 'list')}
            buttons={[
                { value: 'map', label: t('home.map'), icon: 'map-outline' }, 
                { value: 'list', label: t('home.list'), icon: 'format-list-bulleted' }, 
            ]}
            style={styles.viewModeToggle}
        />
      </ThemedView>
      <View style={styles.chipContainer}>
        <FlatList
            data={MACHINE_TYPES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
                <Chip
                    key={item}
                    mode="flat"
                    selected={item === selectedMachineType}
                    onPress={() => setSelectedMachineType(item)}
                    style={styles.chip}
                    icon={() => <MaterialCommunityIcons name="tractor-variant" size={18} color={item === selectedMachineType ? 'white' : '#6750A4'} />}
                >
                    {item}
                </Chip>
            )}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {errorMsg && !loading && (
            <View style={styles.centerMessage}>
                <ThemedText style={{textAlign: 'center'}}>{errorMsg}</ThemedText>
                <Button onPress={onRefresh}>{t('home.tryAgain')}</Button> 
            </View>
        )}
        {!errorMsg && location && viewMode === 'map' && (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
            showsUserLocation
          >
            {machines.map((machine) =>
              machine.last_location ? (
                <Marker
                  key={machine.machine_id}
                  coordinate={{
                    latitude: machine.last_location.latitude,
                    longitude: machine.last_location.longitude,
                  }}
                  title={machine.name || machine.type}
                  description={`${t('home.status')}: ${machine.status}`} 
                  onPress={() => router.push({ pathname: "/booking-modal", params: { machineId: machine.machine_id, machineType: machine.type } })}
                >
                    <View style={styles.markerContainer}>
                        <MaterialCommunityIcons name="tractor" size={32} color="green" />
                    </View>
                </Marker>
              ) : null
            )}
          </MapView>
        )}
         {!errorMsg && viewMode === 'list' && (
             <FlatList
                data={machines}
                keyExtractor={(item) => item.machine_id}
                renderItem={renderMachineItem}
                ListEmptyComponent={!loading ? <View style={styles.centerMessage}><Text>{t('home.noMachines', { machineType: selectedMachineType })}</Text></View> : null} 
                contentContainerStyle={{ paddingBottom: 80 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
             />
         )}
         {loading && (
             <ActivityIndicator size="large" style={styles.loadingIndicator} />
         )}
      </View>

       {/* Voice Command FAB */}
       <FAB
         icon="microphone"
         style={styles.fab}
         onPress={() => Alert.alert(t('home.voiceCommand'), t('home.voiceCommandComingSoon'))} 
       />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50, // For status bar
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewModeToggle: {
    marginTop: 12,
  },
  chipContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -100, // Adjust to be more centered
  },
  listItem: {
      marginVertical: 4,
      marginHorizontal: 8,
      backgroundColor: 'white',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6750A4',
  },
  markerContainer: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
  }
});
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Chip, FAB, IconButton, Text, SegmentedButtons } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import apiClient from '@/api/client';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Machine } from '@/types'; // Import our new type

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

  // --- Location Permission and Fetching ---
  const getLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const msg = 'Permission to access location was denied. Please enable it in your settings.';
      setErrorMsg(msg);
      Alert.alert('Permission Denied', msg);
      setLoading(false);
      return null;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      const msg = 'Could not fetch location. Please ensure GPS is enabled.';
      setErrorMsg(msg);
      Alert.alert('Location Error', `${msg} Please try again.`);
      setLoading(false);
      return null;
    }
  }, []);

  // --- Data Fetching ---
  const fetchMachines = useCallback(async (currentLocation: Location.LocationObject | null) => {
    if (!currentLocation) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get('/farmer/machines/available', { // [cite: uploaded:mlmaniaitis-sudo/pcip/PCIP-c13f35d8b8256af93f91f6ad0e57d310bcf48776/backend/api/farmer.py]
        params: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          machine_type: selectedMachineType,
          radius_km: 50, // This can be a user-adjustable setting later
        },
      });
      setMachines(response.data);
    } catch (error: any) {
      console.error('Failed to fetch machines:', error.response?.data || error.message);
      Alert.alert('Network Error', 'Could not fetch available machines. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedMachineType]); // Depend on selected type

  // --- Initial Load and Refresh Logic ---
  const onRefresh = useCallback(async () => {
    const freshLocation = await getLocation();
    if (freshLocation) {
      await fetchMachines(freshLocation);
    }
  }, [getLocation, fetchMachines]);

  useEffect(() => {
    onRefresh(); // Run on initial component mount
  }, []); // Empty dependency array ensures it runs once on mount

  useEffect(() => {
    // Re-fetch machines when the user selects a different machine type
    if(location) { // Only fetch if we have a location
        fetchMachines(location);
    }
  }, [selectedMachineType, fetchMachines]);


  // --- Render Functions ---
  const renderMachineItem = ({ item }: { item: Machine }) => (
    <Link href={{ pathname: "/booking-modal", params: { machineId: item.machine_id, machineType: item.type } }} asChild>
      <Pressable>
        <Card style={styles.listItem}>
          <Card.Title
            title={item.name || item.type}
            subtitle={`Status: ${item.status} | ~${item.distance_km?.toFixed(1) ?? 'N/A'} km away`}
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
          <ThemedText type="title">Find a Machine</ThemedText>
          <IconButton icon="refresh" size={24} onPress={onRefresh} disabled={loading} />
        </View>
        <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'map' | 'list')}
            buttons={[
                { value: 'map', label: 'Map', icon: 'map-outline' },
                { value: 'list', label: 'List', icon: 'format-list-bulleted' },
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
                <Button onPress={onRefresh}>Try Again</Button>
            </View>
        )}
        {!errorMsg && location && viewMode === 'map' && (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.2, // Zoom level
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
                  description={`Status: ${machine.status}`}
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
                ListEmptyComponent={!loading ? <View style={styles.centerMessage}><Text>No available '{selectedMachineType}' machines found nearby.</Text></View> : null}
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
         onPress={() => Alert.alert('Voice Command', 'Voice command functionality coming soon!')}
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

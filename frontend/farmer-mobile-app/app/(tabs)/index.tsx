// frontend/farmer-mobile-app/app/(tabs)/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MOCK_MACHINES } from '@/constants/mockData';
import { useTranslation } from '@/context/LanguageContext';
import { Machine } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, Card, Chip, FAB, Modal, Portal, SegmentedButtons, Text } from 'react-native-paper';

const MACHINE_TYPES = ['Baler', 'Rotavator', 'Harvester', 'Tractor'];

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineType, setSelectedMachineType] = useState(MACHINE_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isListening, setIsListening] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // --- Location Permission and Fetching ---
  const getLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const msg = t('home.permissionDenied');
      setErrorMsg(msg);
      Alert.alert(t('tabs.home'), msg);
      setLoading(false);
      return null;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      const msg = t('home.locationError');
      setErrorMsg(msg);
      Alert.alert('Location Error', `${msg} ${t('home.tryAgain')}.`);
      setLoading(false);
      return null;
    }
  }, [t]);

  // --- Data Fetching ---
  const fetchMachines = useCallback(async (currentLocation: Location.LocationObject | null) => {
    if (!currentLocation) {
      setLoading(false);
      return;
    }
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      const filteredMachines = MOCK_MACHINES.filter(
        (machine) => machine.type === selectedMachineType && machine.status === 'idle'
      );
      
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
  }, [selectedMachineType, t]);

  // --- Voice Command Handler ---
  const handleVoiceCommand = useCallback(async () => {
    setVoiceModalVisible(true);
    setIsListening(true);

    // Speak greeting
    Speech.speak("मुझे बताएं, आपको कौन सी मशीन चाहिए?", {
      language: 'hi-IN',
      rate: 0.9,
    });

    // Simulate listening for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate recognition (in demo, you'll actually say "baler")
    const recognizedText = "baler"; // Hardcoded for demo
    
    setIsListening(false);

    // Process the command
    if (recognizedText.toLowerCase().includes('baler') || 
        recognizedText.toLowerCase().includes('बैलर')) {
      
      // Speak confirmation
      Speech.speak("बैलर मशीनें खोज रहा हूं", {
        language: 'hi-IN',
        rate: 0.9,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set machine type to Baler
      setSelectedMachineType('Baler');
      setVoiceModalVisible(false);
      
      // Show success message
      Alert.alert(
        t('home.voiceSuccess'),
        t('home.voiceSuccessMsg'),
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      setVoiceModalVisible(false);
      Alert.alert(t('home.voice'), t('home.voiceError'));
    }
  }, [t]);

  // --- Initial Load and Refresh Logic ---
  const onRefresh = useCallback(async () => {
    const freshLocation = await getLocation();
    if (freshLocation) {
      await fetchMachines(freshLocation);
    }
  }, [getLocation, fetchMachines]);

  useEffect(() => {
    onRefresh();
  }, []); 

  useEffect(() => {
    if(location) { 
        fetchMachines(location);
    }
  }, [selectedMachineType, fetchMachines]);

  // --- Render Functions ---
  const renderMachineItem = ({ item }: { item: Machine }) => (
    <Link href={{ pathname: "/booking-modal", params: { machineId: item.machine_id, machineType: item.type } }} asChild>
      <Pressable>
        <Card style={styles.listItem} elevation={1}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="tractor" size={28} color="#4CAF50" />
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.machineName}>{item.name || item.type}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.statusText}>{t('home.status')}: {item.status}</Text>
                </View>
                <Text style={styles.distanceText}>
                  📍 ~{item.distance_km?.toFixed(1) ?? t('home.notAvailable')} {t('home.kmAway')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTopRow}>
          <ThemedText type="title" style={styles.headerTitle}>{t('home.welcomeTo')} Krishi</ThemedText>
        </View>
        <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'map' | 'list')}
            buttons={[
                { 
                  value: 'map', 
                  label: t('home.map'), 
                  icon: 'map-outline',
                  checkedColor: '#FFFFFF',
                  uncheckedColor: '#2E7D32',
                  style: viewMode === 'map' ? styles.segmentedButtonActive : styles.segmentedButton
                },
                { 
                  value: 'list', 
                  label: t('home.list'), 
                  icon: 'format-list-bulleted',
                  checkedColor: '#FFFFFF',
                  uncheckedColor: '#2E7D32',
                  style: viewMode === 'list' ? styles.segmentedButtonActive : styles.segmentedButton
                },
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
                    mode={item === selectedMachineType ? 'flat' : 'outlined'}
                    selected={item === selectedMachineType}
                    onPress={() => setSelectedMachineType(item)}
                    style={[
                      styles.chip,
                      item === selectedMachineType && styles.chipSelected
                    ]}
                    textStyle={item === selectedMachineType ? styles.chipTextSelected : styles.chipText}
                    icon={() => <MaterialCommunityIcons 
                      name="tractor-variant" 
                      size={18} 
                      color={item === selectedMachineType ? '#FFFFFF' : '#2E7D32'} 
                    />}
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
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF5350" />
                <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
                <Button 
                  mode="contained" 
                  onPress={onRefresh}
                  buttonColor="#2E7D32"
                  textColor="#FFFFFF"
                  style={styles.retryButton}
                >
                  {t('home.tryAgain')}
                </Button>
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
                  onPress={() => router.push({ 
                    pathname: "/booking-modal", 
                    params: { machineId: machine.machine_id, machineType: machine.type } 
                  })}
                >
                    <View style={styles.markerContainer}>
                        <MaterialCommunityIcons name="tractor" size={32} color="#2E7D32" />
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
                ListEmptyComponent={!loading ? (
                  <View style={styles.centerMessage}>
                    <MaterialCommunityIcons name="tractor-variant" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>
                      {t('home.noMachinesFound')}
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {t('home.tryDifferentType')}
                    </Text>
                  </View>
                ) : null}
                contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
                refreshControl={
                  <RefreshControl 
                    refreshing={loading} 
                    onRefresh={onRefresh}
                    tintColor="#2E7D32"
                    colors={["#2E7D32", "#4CAF50"]}
                  />
                }
             />
         )}
         
         {loading && (
             <View style={styles.loadingOverlay}>
               <ActivityIndicator size="large" color="#2E7D32" />
               <Text style={styles.loadingText}>{t('home.findingMachines')}</Text>
             </View>
         )}
      </View>

       {/* Voice Command FAB */}
       <FAB
         icon="microphone"
         style={styles.fab}
         color="#FFFFFF"
         onPress={handleVoiceCommand}
         label={t('home.voice')}
       />

       {/* Voice Command Modal */}
       <Portal>
         <Modal
           visible={voiceModalVisible}
           onDismiss={() => setVoiceModalVisible(false)}
           contentContainerStyle={styles.voiceModal}
         >
           <View style={styles.voiceModalContent}>
             <MaterialCommunityIcons 
               name={isListening ? "microphone" : "check-circle"} 
               size={80} 
               color={isListening ? "#F57C00" : "#4CAF50"}
               style={styles.voiceIcon}
             />
             <Text style={styles.voiceModalTitle}>
               {isListening ? t('home.listening') : t('home.recognized')}
             </Text>
             <Text style={styles.voiceModalSubtitle}>
               {isListening ? t('home.sayMachineName') : t('home.viewMachines')}
             </Text>
             {isListening && (
               <View style={styles.pulseContainer}>
                 <View style={[styles.pulse, styles.pulse1]} />
                 <View style={[styles.pulse, styles.pulse2]} />
                 <View style={[styles.pulse, styles.pulse3]} />
               </View>
             )}
           </View>
         </Modal>
       </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#2E7D32',
    fontSize: 24,
    fontWeight: '700',
  },
  viewModeToggle: {
    marginTop: 4,
  },
  segmentedButton: {
    borderColor: '#2E7D32',
  },
  segmentedButtonActive: {
    backgroundColor: '#2E7D32',
  },
  chipContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chip: {
    marginRight: 8,
    borderColor: '#2E7D32',
  },
  chipSelected: {
    backgroundColor: '#2E7D32',
  },
  chipText: {
    color: '#2E7D32',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#757575',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    color: '#BDBDBD',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  listItem: {
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
    textTransform: 'capitalize',
  },
  distanceText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#F57C00',
  },
  markerContainer: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
  },
  voiceModal: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    margin: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  voiceModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIcon: {
    marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  voiceModalSubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  pulseContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F57C00',
    opacity: 0.3,
  },
  pulse1: {
    width: 60,
    height: 60,
  },
  pulse2: {
    width: 80,
    height: 80,
    opacity: 0.2,
  },
  pulse3: {
    width: 100,
    height: 100,
    opacity: 0.1,
  },
});

// constants/mockData.ts
import { Booking, Machine, Parcel, Profile, Wallet } from '@/types'; // Use your existing Machine type


// constants/mockData.ts
export const MOCK_MACHINES: Machine[] = [
  {
    machine_id: 'uuid-machine-1',
    chc_id: 'uuid-chc-andheri',
    name: 'Mahindra Baler XL',
    type: 'Baler',
    device_id: 'DEV001',
    status: 'idle',
    last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.1136, longitude: 72.8697 }, // Andheri area
    created_at: new Date().toISOString(),
    distance_km: 5.2,
  },
  {
    machine_id: 'uuid-machine-2',
    chc_id: 'uuid-chc-bandra',
    name: 'John Deere Baler Pro',
    type: 'Baler',
    device_id: 'DEV002',
    status: 'idle',
    last_seen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.0596, longitude: 72.8295 }, // Bandra area
    created_at: new Date().toISOString(),
    distance_km: 3.8,
  },
  {
    machine_id: 'uuid-machine-3',
    chc_id: 'uuid-chc-thane',
    name: 'Swaraj Rotavator Pro',
    type: 'Rotavator',
    device_id: 'DEV003',
    status: 'idle',
    last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.2183, longitude: 72.9781 }, // Thane area
    created_at: new Date().toISOString(),
    distance_km: 8.1,
  },
  {
    machine_id: 'uuid-machine-4',
    chc_id: 'uuid-chc-navi',
    name: 'Kubota Rotavator',
    type: 'Rotavator',
    device_id: 'DEV004',
    status: 'idle',
    last_seen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.0330, longitude: 73.0297 }, // Navi Mumbai
    created_at: new Date().toISOString(),
    distance_km: 12.5,
  },
  {
    machine_id: 'uuid-machine-5',
    chc_id: 'uuid-chc-goregaon',
    name: 'John Deere Harvester XL',
    type: 'Harvester',
    device_id: 'DEV005',
    status: 'idle',
    last_seen: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.1663, longitude: 72.8526 }, // Goregaon area
    created_at: new Date().toISOString(),
    distance_km: 6.7,
  },
  {
    machine_id: 'uuid-machine-6',
    chc_id: 'uuid-chc-powai',
    name: 'Mahindra Harvester Pro',
    type: 'Harvester',
    device_id: 'DEV006',
    status: 'idle',
    last_seen: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.1176, longitude: 72.9060 }, // Powai area
    created_at: new Date().toISOString(),
    distance_km: 9.2,
  },
  {
    machine_id: 'uuid-machine-7',
    chc_id: 'uuid-chc-borivali',
    name: 'Sonalika Tractor 750',
    type: 'Tractor',
    device_id: 'DEV007',
    status: 'idle',
    last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.2307, longitude: 72.8567 }, // Borivali area
    created_at: new Date().toISOString(),
    distance_km: 3.1,
  },
  {
    machine_id: 'uuid-machine-8',
    chc_id: 'uuid-chc-malad',
    name: 'Massey Ferguson Tractor',
    type: 'Tractor',
    device_id: 'DEV008',
    status: 'idle',
    last_seen: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    last_location: { latitude: 19.1868, longitude: 72.8483 }, // Malad area
    created_at: new Date().toISOString(),
    distance_km: 4.5,
  },
];


export const MOCK_BOOKINGS: Booking[] = [
 {
    booking_id: 'uuid-booking-1',
    farmer_id: 'uuid-farmer-123', // Match logged in user if needed
    machine_type_requested: 'Baler',
    parcel_id: 'uuid-parcel-A',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    scheduled_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    completed_time: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
    final_amount: 1500.00,
  },
  {
    booking_id: 'uuid-booking-2',
    farmer_id: 'uuid-farmer-123',
    machine_type_requested: 'Rotavator',
    parcel_id: 'uuid-parcel-B',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    booking_id: 'uuid-booking-3',
    farmer_id: 'uuid-farmer-123',
    machine_type_requested: 'Harvester',
    parcel_id: 'uuid-parcel-A',
    status: 'accepted',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    scheduled_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  },
    {
    booking_id: 'uuid-booking-4',
    farmer_id: 'uuid-farmer-123',
    machine_type_requested: 'Tractor',
    parcel_id: 'uuid-parcel-C', // Assume another parcel
    status: 'cancelled',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
];

export const MOCK_WALLET: Wallet = {
    farmer_id: 'uuid-farmer-123',
    available_balance: 150.75,
    total_earned: 250.75,
    total_redeemed: 100.00,
    recent_history: [
        { 
            credit_id: 'gc-1', 
            amount: 100.00, 
            status: 'available', 
            awarded_on: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            source_booking_id: 'uuid-booking-1'
        },
        { 
            credit_id: 'gc-2', 
            amount: 100.00, 
            status: 'redeemed', 
            awarded_on: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
            redeemed_on: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
            credit_id: 'gc-3', 
            amount: 50.75, 
            status: 'available', 
            awarded_on: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            source_booking_id: 'uuid-booking-4' // From a "cancelled" booking
        },
    ]
};

export const MOCK_PROFILE: Profile = {
    farmer_id: 'uuid-farmer-123',
    pm_kisan_id: 'PMK123456789',
    village: 'Rampur',
    district: 'Ambala',
    state: 'Haryana',
    created_at: new Date().toISOString(),
};

export const MOCK_PARCELS: Parcel[] = [
    {
        parcel_id: 'uuid-parcel-A',
        farmer_id: 'uuid-farmer-123',
        geometry: { type: "Polygon", coordinates: [[[77.10, 28.70], [77.11, 28.70], [77.11, 28.71], [77.10, 28.71], [77.10, 28.70]]] },
        crop: 'Rice',
        expected_harvest_date: '2025-11-15',
        area_hectares: 2.5,
        created_at: new Date().toISOString(),
    },
    {
        parcel_id: 'uuid-parcel-B',
        farmer_id: 'uuid-farmer-123',
        geometry: { type: "Polygon", coordinates: [[[77.12, 28.72], [77.13, 28.72], [77.13, 28.73], [77.12, 28.73], [77.12, 28.72]]] },
        crop: 'Wheat',
        expected_harvest_date: '2026-04-10',
        area_hectares: 1.8,
        created_at: new Date().toISOString(),
    },
];
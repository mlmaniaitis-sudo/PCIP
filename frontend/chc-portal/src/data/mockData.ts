export interface Machine {
  id: string;
  name: string;
  type: 'Baler' | 'Rotavator' | 'Harvester' | 'Tractor';
  status: 'idle' | 'running' | 'offline' | 'maintenance';
  lastSeen: string;
  location: { lat: number; lng: number }; // ✅ Changed 'lon' to 'lng' for consistency
}

export interface Booking {
  id: string;
  farmerName: string;
  parcelId: string;
  parcelArea: number;
  machineType: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  requestedTime: string;
  scheduledTime?: string;
}

export const machines: Machine[] = [
  {
    id: 'M001',
    name: 'Harvester Alpha',
    type: 'Harvester',
    status: 'running',
    lastSeen: new Date().toISOString(),
    location: { lat: 30.7304, lng: 76.7785 } // ✅ Changed lon → lng
  },
  {
    id: 'M002',
    name: 'Tractor Beta',
    type: 'Tractor',
    status: 'idle',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    location: { lat: 30.7520, lng: 76.8012 } // ✅ Changed lon → lng
  },
  {
    id: 'M003',
    name: 'Rotavator Gamma',
    type: 'Rotavator',
    status: 'running',
    lastSeen: new Date().toISOString(),
    location: { lat: 30.7015, lng: 76.7542 } // ✅ Changed lon → lng
  },
  {
    id: 'M004',
    name: 'Baler Delta',
    type: 'Baler',
    status: 'maintenance',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    location: { lat: 30.7823, lng: 76.8234 } // ✅ Changed lon → lng
  },
  {
    id: 'M005',
    name: 'Tractor Epsilon',
    type: 'Tractor',
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    location: { lat: 30.6845, lng: 76.7312 } // ✅ Changed lon → lng
  },
  {
    id: 'M006',
    name: 'Harvester Zeta',
    type: 'Harvester',
    status: 'idle',
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    location: { lat: 30.7689, lng: 76.7923 }
  },
  {
    id: 'M007',
    name: 'Baler Theta',
    type: 'Baler',
    status: 'running',
    lastSeen: new Date().toISOString(),
    location: { lat: 30.7156, lng: 76.7678 }
  }
];

export const bookings: Booking[] = [
  {
    id: 'B001',
    farmerName: 'Rajesh Kumar',
    parcelId: 'P123',
    parcelArea: 5.5,
    machineType: 'Harvester',
    status: 'pending',
    requestedTime: new Date(Date.now() - 300000).toISOString() // 5 min ago
  },
  {
    id: 'B002',
    farmerName: 'Amit Singh',
    parcelId: 'P124',
    parcelArea: 3.2,
    machineType: 'Tractor',
    status: 'accepted',
    requestedTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    scheduledTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  },
  {
    id: 'B003',
    farmerName: 'Priya Sharma',
    parcelId: 'P125',
    parcelArea: 8.0,
    machineType: 'Rotavator',
    status: 'in_progress',
    requestedTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    scheduledTime: new Date(Date.now() - 3600000).toISOString() // 1 hour ago (started)
  },
  {
    id: 'B004',
    farmerName: 'Suresh Patel',
    parcelId: 'P126',
    parcelArea: 4.5,
    machineType: 'Baler',
    status: 'completed',
    requestedTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    scheduledTime: new Date(Date.now() - 82800000).toISOString() // 23 hours ago
  },
  {
    id: 'B005',
    farmerName: 'Deepak Verma',
    parcelId: 'P127',
    parcelArea: 6.8,
    machineType: 'Harvester',
    status: 'pending',
    requestedTime: new Date(Date.now() - 600000).toISOString() // 10 min ago
  },
  {
    id: 'B006',
    farmerName: 'Meena Devi',
    parcelId: 'P128',
    parcelArea: 2.5,
    machineType: 'Tractor',
    status: 'cancelled',
    requestedTime: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: 'B007',
    farmerName: 'Vikram Yadav',
    parcelId: 'P129',
    parcelArea: 7.2,
    machineType: 'Rotavator',
    status: 'accepted',
    requestedTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    scheduledTime: new Date(Date.now() + 7200000).toISOString() // 2 hours from now
  },
  {
    id: 'B008',
    farmerName: 'Sunita Reddy',
    parcelId: 'P130',
    parcelArea: 5.0,
    machineType: 'Baler',
    status: 'completed',
    requestedTime: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    scheduledTime: new Date(Date.now() - 39600000).toISOString() // 11 hours ago
  },
  {
    id: 'B009',
    farmerName: 'Arjun Gupta',
    parcelId: 'P131',
    parcelArea: 9.5,
    machineType: 'Harvester',
    status: 'in_progress',
    requestedTime: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    scheduledTime: new Date(Date.now() - 5400000).toISOString() // 1.5 hours ago (started)
  },
  {
    id: 'B010',
    farmerName: 'Lakshmi Nair',
    parcelId: 'P132',
    parcelArea: 4.0,
    machineType: 'Tractor',
    status: 'pending',
    requestedTime: new Date(Date.now() - 120000).toISOString() // 2 min ago
  }
];

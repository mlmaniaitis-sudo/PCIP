export interface Machine {
  id: string;
  name: string;
  type: 'Baler' | 'Rotavator' | 'Harvester' | 'Tractor';
  status: 'idle' | 'running' | 'offline' | 'maintenance';
  lastSeen: string;
  location: { lat: number; lon: number };
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
    location: { lat: 30.73, lon: 76.77 }
  },
  {
    id: 'M002',
    name: 'Tractor Beta',
    type: 'Tractor',
    status: 'idle',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    location: { lat: 30.75, lon: 76.80 }
  },
  {
    id: 'M003',
    name: 'Rotavator Gamma',
    type: 'Rotavator',
    status: 'running',
    lastSeen: new Date().toISOString(),
    location: { lat: 30.70, lon: 76.75 }
  },
  {
    id: 'M004',
    name: 'Baler Delta',
    type: 'Baler',
    status: 'maintenance',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    location: { lat: 30.78, lon: 76.82 }
  },
  {
    id: 'M005',
    name: 'Tractor Epsilon',
    type: 'Tractor',
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    location: { lat: 30.68, lon: 76.73 }
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
    requestedTime: new Date(Date.now() + 3600000).toISOString()
  },
  {
    id: 'B002',
    farmerName: 'Amit Singh',
    parcelId: 'P124',
    parcelArea: 3.2,
    machineType: 'Tractor',
    status: 'accepted',
    requestedTime: new Date(Date.now() + 7200000).toISOString(),
    scheduledTime: new Date(Date.now() + 7200000).toISOString()
  },
  {
    id: 'B003',
    farmerName: 'Priya Sharma',
    parcelId: 'P125',
    parcelArea: 8.0,
    machineType: 'Rotavator',
    status: 'in_progress',
    requestedTime: new Date().toISOString(),
    scheduledTime: new Date().toISOString()
  },
  {
    id: 'B004',
    farmerName: 'Suresh Patel',
    parcelId: 'P126',
    parcelArea: 4.5,
    machineType: 'Baler',
    status: 'completed',
    requestedTime: new Date(Date.now() - 3600000).toISOString(),
    scheduledTime: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'B005',
    farmerName: 'Deepak Verma',
    parcelId: 'P127',
    parcelArea: 6.8,
    machineType: 'Harvester',
    status: 'pending',
    requestedTime: new Date(Date.now() + 10800000).toISOString()
  },
  {
    id: 'B006',
    farmerName: 'Meena Devi',
    parcelId: 'P128',
    parcelArea: 2.5,
    machineType: 'Tractor',
    status: 'cancelled',
    requestedTime: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'B007',
    farmerName: 'Vikram Yadav',
    parcelId: 'P129',
    parcelArea: 7.2,
    machineType: 'Rotavator',
    status: 'accepted',
    requestedTime: new Date(Date.now() + 14400000).toISOString(),
    scheduledTime: new Date(Date.now() + 14400000).toISOString()
  },
  {
    id: 'B008',
    farmerName: 'Sunita Reddy',
    parcelId: 'P130',
    parcelArea: 5.0,
    machineType: 'Baler',
    status: 'completed',
    requestedTime: new Date(Date.now() - 10800000).toISOString(),
    scheduledTime: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'B009',
    farmerName: 'Arjun Gupta',
    parcelId: 'P131',
    parcelArea: 9.5,
    machineType: 'Harvester',
    status: 'in_progress',
    requestedTime: new Date().toISOString(),
    scheduledTime: new Date().toISOString()
  },
  {
    id: 'B010',
    farmerName: 'Lakshmi Nair',
    parcelId: 'P132',
    parcelArea: 4.0,
    machineType: 'Tractor',
    status: 'pending',
    requestedTime: new Date(Date.now() + 21600000).toISOString()
  }
];

// It's good practice to have a central place for types.

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface Machine {
  machine_id: string; // This is a UUID string
  chc_id: string; // This is a UUID string
  name?: string | null;
  type: string;
  device_id?: string | null;
  status: string;
  last_seen?: string | null; // This will be an ISO date string
  last_location?: LocationPoint | null;
  created_at: string; // This will be an ISO date string
  distance_km?: number; // This is added by our API query
}

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  booking_id: string;
  farmer_id: string;
  machine_type_requested: string;
  parcel_id: string;
  status: BookingStatus;
  created_at: string; // ISO Date string
  scheduled_time?: string; // ISO Date string
  completed_time?: string; // ISO Date string
  final_amount?: number;
}

export interface Profile {
  farmer_id: string;
  pm_kisan_id: string;
  village: string;
  district: string;
  state: string;
  created_at: string; // ISO Date string
}

export interface Parcel {
    parcel_id: string;
    farmer_id: string;
    geometry: any; // Using 'any' for mock GeoJSON
    crop: string;
    expected_harvest_date: string; // YYYY-MM-DD
    area_hectares: number;
    created_at: string; // ISO Date string
}

export type CreditStatus = 'available' | 'redeemed' | 'pending';

export interface CreditTransaction {
    credit_id: string;
    amount: number;
    status: CreditStatus;
    awarded_on: string; // ISO Date string
    redeemed_on?: string; // ISO Date string
    source_booking_id?: string;
}

export interface Wallet {
    farmer_id: string;
    available_balance: number;
    total_earned: number;
    total_redeemed: number;
    recent_history: CreditTransaction[];
}
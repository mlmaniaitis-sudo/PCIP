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

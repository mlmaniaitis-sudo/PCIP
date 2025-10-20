-- PCIP Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USER & AUTHENTICATION TABLES
-- Central table for all users. Farmers use OTP. Staff use passwords.
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL, -- Farmer login
    hashed_password TEXT,                     -- CHC/Gov login (NULL for farmers)
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'chc_staff', 'gov_admin')),
    full_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP storage for farmer authentication
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

-- 2. CHC & MACHINE TABLES
CREATE TABLE chcs (
    chc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES users(user_id),
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(15),
    -- Use PostGIS GEOGRAPHY type for real-world lat/lon
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE machines (
    machine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chc_id UUID REFERENCES chcs(chc_id) NOT NULL,
    device_id VARCHAR(100) UNIQUE, -- The ID of the physical IoT tracker
    name VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- e.g., 'Baler', 'Rotavator'
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'idle', 'running', 'maintenance')),
    last_seen TIMESTAMPTZ,
    last_location GEOGRAPHY(POINT, 4326), -- PostGIS location point
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IOT & TELEMETRY TABLE (TimescaleDB + PostGIS)
CREATE TABLE telemetry (
    ts TIMESTAMPTZ NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    machine_id UUID REFERENCES machines(machine_id),
    location GEOGRAPHY(POINT, 4326),
    engine_on BOOLEAN,
    rpm INT,
    vibration FLOAT,
    battery INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- *** CRITICAL: Convert telemetry into a TimescaleDB hypertable ***
SELECT create_hypertable('telemetry', 'ts');
-- *** CRITICAL: Create a spatial index for fast location queries ***
CREATE INDEX telemetry_location_idx ON telemetry USING GIST (location);
CREATE INDEX telemetry_device_id_idx ON telemetry (device_id);
CREATE INDEX telemetry_machine_id_idx ON telemetry (machine_id);

-- 4. FARMER & LAND TABLES
CREATE TABLE farmer_profiles (
    farmer_id UUID PRIMARY KEY REFERENCES users(user_id),
    pm_kisan_id VARCHAR(50) UNIQUE,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parcels (
    parcel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmer_profiles(farmer_id),
    -- Use PostGIS GEOMETRY for polygons (farm boundaries)
    geom GEOMETRY(POLYGON, 4326) NOT NULL,
    crop VARCHAR(50),
    expected_harvest_date DATE,
    area_hectares FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- *** CRITICAL: Create a spatial index for fast "point-in-polygon" queries ***
CREATE INDEX parcels_geom_idx ON parcels USING GIST (geom);
CREATE INDEX parcels_farmer_id_idx ON parcels (farmer_id);

-- 5. BOOKING & VERIFICATION TABLES
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmer_profiles(farmer_id),
    chc_id UUID REFERENCES chcs(chc_id),
    machine_id UUID REFERENCES machines(machine_id),
    machine_type_requested VARCHAR(50) NOT NULL,
    parcel_id UUID REFERENCES parcels(parcel_id),
    requested_time TIMESTAMPTZ,
    scheduled_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    final_amount DECIMAL(10, 2),
    notes TEXT
);

CREATE TABLE satellite_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id UUID REFERENCES parcels(parcel_id),
    image_date DATE NOT NULL,
    ndvi FLOAT,
    sindri FLOAT,
    nbr FLOAT, -- Normalized Burn Ratio
    burn_flag BOOLEAN DEFAULT FALSE,
    confidence FLOAT,
    source VARCHAR(50), -- e.g., 'Sentinel-2'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE green_credits (
    credit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmer_profiles(farmer_id),
    source_booking_id UUID REFERENCES bookings(booking_id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'redeemed')),
    awarded_on TIMESTAMPTZ DEFAULT NOW(),
    redeemed_on TIMESTAMPTZ,
    notes TEXT
);

-- 6. SYSTEM CONFIGURATION AND LOGS
CREATE TABLE system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX users_phone_number_idx ON users (phone_number);
CREATE INDEX users_role_idx ON users (role);
CREATE INDEX otp_codes_phone_expires_idx ON otp_codes (phone_number, expires_at);
CREATE INDEX chcs_location_idx ON chcs USING GIST (location);
CREATE INDEX machines_chc_id_idx ON machines (chc_id);
CREATE INDEX machines_status_idx ON machines (status);
CREATE INDEX machines_device_id_idx ON machines (device_id);
CREATE INDEX bookings_farmer_id_idx ON bookings (farmer_id);
CREATE INDEX bookings_chc_id_idx ON bookings (chc_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_created_at_idx ON bookings (created_at);
CREATE INDEX satellite_events_parcel_id_idx ON satellite_events (parcel_id);
CREATE INDEX satellite_events_image_date_idx ON satellite_events (image_date);
CREATE INDEX green_credits_farmer_id_idx ON green_credits (farmer_id);
CREATE INDEX green_credits_status_idx ON green_credits (status);
CREATE INDEX audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at);

-- Insert default system configurations
INSERT INTO system_config (config_key, config_value, description) VALUES
('otp_expiry_minutes', '5', 'OTP expiry time in minutes'),
('max_booking_radius_km', '50', 'Maximum radius for machine booking in kilometers'),
('green_credit_rate', '100.0', 'Green credits per successful verification'),
('jwt_secret_key', 'your-secret-key-change-this', 'JWT secret key for token generation'),
('jwt_expiry_hours', '24', 'JWT token expiry in hours');
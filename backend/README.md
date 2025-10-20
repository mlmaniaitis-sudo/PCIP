# PCIP Backend - Predictive Compliance & Incentive Platform

A comprehensive backend system for managing IoT-enabled agricultural machinery, farmer bookings, satellite verification, and green credit allocation.

## 🏗️ Architecture

This backend is built using:
- **FastAPI** - Modern Python web framework
- **TimescaleDB** - Time-series database for IoT telemetry
- **PostGIS** - Spatial database extension for geographic operations
- **AsyncPG** - Async PostgreSQL driver
- **MQTT** - For real-time IoT data ingestion
- **WebSockets** - For real-time notifications

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Conda (recommended)

### 2. Environment Setup

```bash
# Create and activate conda environment
conda create -n pcip python=3.11 -y
conda activate pcip

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Start the database
docker-compose up -d

# Wait for database to be ready (check with)
docker logs pcip_db

# The database schema is automatically initialized via init-scripts/01_schema.sql
```

### 4. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration as needed
nano .env
```

### 5. Start the API Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Start the MQTT Listener (Optional)

```bash
# In a separate terminal
python mqtt_listener.py
```

## 📊 Database Schema

### Core Tables

- **users** - All system users (farmers, CHC staff, government admins)
- **chcs** - Custom Hiring Centers with geographic locations
- **machines** - Agricultural machines with IoT tracking
- **telemetry** - TimescaleDB hypertable for IoT sensor data
- **farmer_profiles** - Extended farmer information
- **parcels** - Farm land parcels with PostGIS polygons
- **bookings** - Machine booking requests and status
- **satellite_events** - Satellite imagery analysis results
- **green_credits** - Carbon credit allocation tracking

### Key Features

- **Spatial Indexing**: Fast geospatial queries using PostGIS
- **Time-Series Storage**: Efficient IoT data storage with TimescaleDB
- **Real-time Processing**: MQTT ingestion with automatic status updates

## 🔧 API Structure

### Core Components

```
├── main.py                 # FastAPI application entry point
├── core/
│   ├── config.py          # Application configuration
│   ├── database.py        # Database connection manager
│   └── security.py        # Authentication & security utilities
├── db/
│   └── schemas.py         # Pydantic models for API validation
├── services/
│   └── iot_service.py     # IoT telemetry processing
├── websocket/
│   └── manager.py         # WebSocket connection management
└── mqtt_listener.py       # MQTT broker listener
```

## 🌐 API Endpoints (When Added)

The backend is prepared for these API endpoint categories:

### Authentication
- `POST /auth/otp/send` - Send OTP to farmer
- `POST /auth/otp/verify` - Verify OTP and login
- `POST /auth/login` - CHC/Gov user login
- `GET /users/me` - Get current user profile

### IoT Data
- `POST /telemetry` - HTTP telemetry ingestion
- MQTT: `telemetry/{device_id}` - Real-time telemetry

### Farmer Operations
- `GET /machines/available` - Find nearby machines
- `POST /bookings` - Create machine booking
- `GET /bookings/my` - List farmer's bookings
- `GET /credits/my-wallet` - Check green credits

### CHC Management
- `GET /chc/dashboard/overview` - CHC dashboard KPIs
- `GET /chc/machines` - Manage CHC machines
- `GET /chc/bookings` - Manage bookings
- `WS /ws/chc/{chc_id}` - Real-time notifications

### Government Dashboard
- `GET /gov/dashboard/kpis` - System-wide metrics
- `GET /gov/reports/utilization` - Utilization reports
- `GET /gov/reports/compliance` - Compliance audit
- `GET /gov/map/risk` - Risk prediction map

## 🤖 IoT Data Flow

### MQTT Telemetry Format

```json
{
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "engine_on": true,
  "rpm": 1800,
  "vibration": 2.5,
  "battery": 85,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Processing Pipeline

1. **Ingestion**: MQTT listener receives data
2. **Validation**: Pydantic schema validation
3. **Storage**: Insert into TimescaleDB hypertable
4. **Status Update**: Update machine status and location
5. **Notifications**: WebSocket alerts for status changes

## 🛡️ Security

### Authentication Methods

- **Farmers**: OTP-based authentication via SMS
- **CHC Staff**: Username/password with JWT tokens
- **Government**: Username/password with JWT tokens

### Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Request validation with Pydantic
- Database connection pooling

## 📍 Geospatial Features

### PostGIS Integration

- **Machine Tracking**: Real-time location updates
- **Proximity Search**: Find machines within radius
- **Parcel Management**: Farm boundary polygons
- **Spatial Indexing**: Optimized geographic queries

### Coordinate System

- Uses WGS84 (EPSG:4326) for all geographic data
- PostGIS GEOGRAPHY type for accurate distance calculations
- Automatic spatial indexing for performance

## 📈 Monitoring & Analytics

### Database Performance

- TimescaleDB compression for historical data
- Automatic partitioning by time
- Spatial indexes for geographic queries
- Connection pooling for concurrent access

### Real-time Metrics

- Machine utilization statistics
- System-wide KPIs
- WebSocket connection monitoring
- MQTT message processing rates

## 🔧 Development

### Database Management

```bash
# Connect to database
docker exec -it pcip_db psql -U pcip_user -d pcip_db

# View telemetry data
SELECT * FROM telemetry ORDER BY ts DESC LIMIT 10;

# Check machine status
SELECT name, status, last_seen FROM machines;
```

### Testing MQTT

```bash
# Install mosquitto clients
sudo apt-get install mosquitto-clients

# Send test telemetry
mosquitto_pub -h localhost -t telemetry/TEST001 -m '{
  "location": {"latitude": 28.6139, "longitude": 77.2090},
  "engine_on": true,
  "rpm": 1800,
  "battery": 85
}'
```

## 📁 Project Structure

```
pcip-backend/
├── main.py                 # FastAPI application
├── mqtt_listener.py        # MQTT data ingestion
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Database container
├── .env.example           # Configuration template
├── README.md              # This file
├── core/                  # Core application logic
├── db/                    # Database models & schemas
├── services/              # Business logic services
├── websocket/             # WebSocket management
└── init-scripts/          # Database initialization
    └── 01_schema.sql      # Complete database schema
```

## 🚀 Production Deployment

### Environment Variables

Set these in production:
- `SECRET_KEY` - Strong secret for JWT signing
- `DB_PASSWORD` - Secure database password
- `TWILIO_*` - SMS service credentials
- `GOOGLE_APPLICATION_CREDENTIALS` - GCP service account

### Database Scaling

- Enable TimescaleDB compression
- Set up read replicas for analytics
- Configure automatic backups
- Monitor disk space and performance

### Security Hardening

- Use HTTPS/TLS in production
- Configure CORS properly
- Set up rate limiting
- Enable database SSL connections
- Use secrets management for credentials

## 📞 Support

For issues and questions:
1. Check the logs: `docker logs pcip_db`
2. Verify configuration in `.env`
3. Test database connectivity
4. Monitor MQTT message flow
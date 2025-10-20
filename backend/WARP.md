# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: FastAPI (ASGI), asyncpg, TimescaleDB + PostGIS (via Docker), Pydantic v2, MQTT (paho-mqtt), WebSockets.
- Entrypoints: API server in main.py, MQTT ingester in mqtt_listener.py. Database schema auto-initialized by init-scripts/01_schema.sql when docker-compose starts the DB.

Common commands
- Environment
  - Create env (recommended via conda):
    - conda create -n pcip python=3.11 -y
    - conda activate pcip
  - Install deps: pip install -r requirements.txt
  - Copy env: cp .env.example .env
- Database (TimescaleDB + PostGIS)
  - Image: timescale/timescaledb-postgis:latest-pg13 (set in docker-compose.yml)
  - Start DB: docker-compose up -d
  - Check DB logs: docker logs pcip_db
  - psql shell: docker exec -it pcip_db psql -U pcip_user -d pcip_db
  - If switching major PG versions: docker-compose down && rm -rf ./pgdata && docker-compose up -d
- Run API server
  - Dev (auto-reload): python main.py
  - Via uvicorn: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
- Run MQTT listener
  - python mqtt_listener.py
- MQTT test (optional)
  - mosquitto_pub -h localhost -t telemetry/TEST001 -m '{"location": {"latitude": 28.6139, "longitude": 77.2090}, "engine_on": true, "rpm": 1800, "battery": 85}'
- MQTT broker (Mosquitto)
  - Quick (local-only): docker run -it -p 1883:1883 eclipse-mosquitto
  - Recommended (dev):
    - Create config file mosquitto.conf with:
      - listener 1883
      - allow_anonymous true
      - persistence false
    - Run broker: docker rm -f pcip_mqtt 2>/dev/null || true && docker run -d --name pcip_mqtt -p 1883:1883 -v "$PWD/mosquitto.conf:/mosquitto/config/mosquitto.conf" eclipse-mosquitto:2
- Tests and linting
  - No tests, linters, or formatters detected in this repo. If a test framework is added later (e.g., pytest), document commands here.

High-level architecture
- API app (main.py)
  - FastAPI app with lifespan context establishes and tears down a shared asyncpg pool (DatabaseManager). CORS enabled for all origins (tighten in production). Health endpoints at / and /health; /health performs a live DB query via the pool.
- Configuration (core/config.py)
  - Pydantic BaseSettings reads from .env. Exposes DATABASE_URL/ASYNCPG_DATABASE_URL, JWT settings, MQTT, Twilio, and app-specific knobs (e.g., MAX_BOOKING_RADIUS_KM).
- Database access (core/database.py)
  - DatabaseManager wraps asyncpg pool creation and query helpers (fetch_one, fetch_all, execute, executemany). A module-level db instance exists for shared use.
- AuthN/AuthZ (core/security.py)
  - bcrypt password hashing, JWT creation/verification, and FastAPI dependencies for role-restricted access (farmer, chc_staff, gov_admin). OTP storage/verification persists to otp_codes.
- Data models (db/schemas.py)
  - Pydantic v2 models for Users, CHC, Machines, Telemetry, Farmer Profiles, Parcels, Bookings, Satellite Events, Green Credits, and dashboard responses. Enforces field validation (e.g., coordinates, enums).
- IoT telemetry service (services/iot_service.py)
  - Ingests TelemetryPayload, inserts rows into telemetry hypertable with optional PostGIS location, and updates machine status/last_seen/last_location. Provides helpers to fetch telemetry history and CHC utilization stats. Uses PostGIS functions (ST_GeogFromText, ST_X/ST_Y) and asyncpg queries.
- WebSocket connections (websocket/manager.py)
  - Manages connection sets for CHCs and users; supports targeted send, broadcast, and connection stats. Intended for real-time notifications (e.g., booking status, machine events).
- MQTT ingestion (mqtt_listener.py)
  - Subscribes to telemetry/+ topics; parses payloads; schedules processing on the asyncio event loop; uses the shared global db (core.database.db) for DB access.
- Database schema (init-scripts/01_schema.sql)
  - Enables timescaledb and postgis; defines users, otp_codes, chcs, machines, telemetry (as hypertable), farmer_profiles, parcels (geometry polygon), bookings, satellite_events, green_credits, system_config, audit_logs, plus critical indexes and spatial indexes.

Notes for future changes
- API routers/endpoints are not yet implemented beyond health checks; when adding routers, prefer dependency injection for DatabaseManager and role-guard dependencies from core/security.py.
- Tighten CORS and replace default secrets in production using .env.

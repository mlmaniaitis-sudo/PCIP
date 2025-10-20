import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from core.database import db
from db.schemas import TelemetryPayload

class IoTTelemetryService:
    """Service for handling IoT telemetry data ingestion"""
    
    async def ingest_telemetry(self, payload: TelemetryPayload) -> bool:
        """
        Ingest telemetry data into TimescaleDB and update machine status
        
        Args:
            payload: Telemetry data payload
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Use current timestamp if not provided
            timestamp = payload.timestamp or datetime.utcnow()
            
            # Get machine ID from device_id
            machine = await db.fetch_one(
                "SELECT machine_id, chc_id FROM machines WHERE device_id = $1",
                payload.device_id
            )
            
            if not machine:
                print(f"Warning: Unknown device_id {payload.device_id}")
                machine_id = None
            else:
                machine_id = machine["machine_id"]
            
            # Create PostGIS point from location if provided
            location_point = None
            if payload.location:
                location_point = f"POINT({payload.location.longitude} {payload.location.latitude})"
            
            # Insert telemetry data into TimescaleDB hypertable
            await db.execute(
                """INSERT INTO telemetry (ts, device_id, machine_id, location, engine_on, rpm, vibration, battery)
                   VALUES ($1, $2, $3, ST_GeogFromText($4), $5, $6, $7, $8)""",
                timestamp,
                payload.device_id,
                machine_id,
                location_point,
                payload.engine_on,
                payload.rpm,
                payload.vibration,
                payload.battery
            )
            
            # Update machine status and location if machine exists
            if machine_id:
                await self._update_machine_status(machine_id, payload, location_point)
            
            return True
            
        except Exception as e:
            print(f"Error ingesting telemetry data: {e}")
            return False
    
    async def _update_machine_status(self, machine_id: UUID, payload: TelemetryPayload, location_point: Optional[str]):
        """Update machine status based on telemetry data"""
        try:
            # Determine machine status based on telemetry
            status = "offline"
            if payload.engine_on is True and payload.rpm and payload.rpm > 0:
                status = "running"
            elif payload.engine_on is False or (payload.rpm is not None and payload.rpm == 0):
                status = "idle"
            elif payload.battery is not None and payload.battery < 10:
                status = "maintenance"
            
            # Update machine record
            update_query = """
                UPDATE machines 
                SET status = $1, last_seen = NOW(), updated_at = NOW()
            """
            params = [status]
            
            if location_point:
                update_query += ", last_location = ST_GeogFromText($2)"
                params.append(location_point)
            
            update_query += " WHERE machine_id = ${}".format(len(params) + 1)
            params.append(machine_id)
            
            await db.execute(update_query, *params)
            
        except Exception as e:
            print(f"Error updating machine status: {e}")
    
    async def get_machine_telemetry_history(
        self, 
        machine_id: UUID, 
        hours: int = 24
    ) -> list[dict]:
        """Get telemetry history for a machine"""
        try:
            rows = await db.fetch_all(
                """SELECT ts, device_id, 
                          ST_X(location::geometry) as longitude,
                          ST_Y(location::geometry) as latitude,
                          engine_on, rpm, vibration, battery
                   FROM telemetry 
                   WHERE machine_id = $1 AND ts >= NOW() - INTERVAL '%s hours'
                   ORDER BY ts DESC
                   LIMIT 1000""",
                machine_id, hours
            )
            
            telemetry_data = []
            for row in rows:
                data = dict(row)
                # Convert location to proper format
                if data.get('longitude') and data.get('latitude'):
                    data['location'] = {
                        'longitude': data.pop('longitude'),
                        'latitude': data.pop('latitude')
                    }
                else:
                    data['location'] = None
                    data.pop('longitude', None)
                    data.pop('latitude', None)
                
                telemetry_data.append(data)
            
            return telemetry_data
            
        except Exception as e:
            print(f"Error fetching telemetry history: {e}")
            return []
    
    async def get_utilization_stats(self, chc_id: UUID, hours: int = 24) -> dict:
        """Get machine utilization statistics for a CHC"""
        try:
            # Get total runtime hours for CHC machines in the specified period
            result = await db.fetch_one(
                """SELECT 
                     COUNT(DISTINCT m.machine_id) as total_machines,
                     COUNT(DISTINCT CASE WHEN t.engine_on = true THEN t.machine_id END) as active_machines,
                     EXTRACT(EPOCH FROM SUM(
                         CASE WHEN t.engine_on = true THEN INTERVAL '1 minute' ELSE INTERVAL '0' END
                     )) / 3600.0 as total_runtime_hours
                   FROM machines m
                   LEFT JOIN telemetry t ON m.machine_id = t.machine_id 
                     AND t.ts >= NOW() - INTERVAL '%s hours'
                   WHERE m.chc_id = $1""",
                chc_id, hours
            )
            
            if result:
                total_machines = result['total_machines'] or 0
                total_runtime_hours = result['total_runtime_hours'] or 0
                
                # Calculate utilization percentage
                max_possible_hours = total_machines * hours
                utilization_percentage = (total_runtime_hours / max_possible_hours * 100) if max_possible_hours > 0 else 0
                
                return {
                    'total_machines': total_machines,
                    'active_machines': result['active_machines'] or 0,
                    'total_runtime_hours': round(total_runtime_hours, 2),
                    'utilization_percentage': round(utilization_percentage, 2)
                }
            
            return {
                'total_machines': 0,
                'active_machines': 0,
                'total_runtime_hours': 0,
                'utilization_percentage': 0
            }
            
        except Exception as e:
            print(f"Error calculating utilization stats: {e}")
            return {
                'total_machines': 0,
                'active_machines': 0,
                'total_runtime_hours': 0,
                'utilization_percentage': 0
            }

# Global service instance
iot_service = IoTTelemetryService()
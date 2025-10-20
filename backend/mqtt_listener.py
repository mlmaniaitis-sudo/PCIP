#!/usr/bin/env python3
"""
MQTT Listener for IoT Telemetry Data Ingestion

This script connects to an MQTT broker and listens for telemetry data
from IoT devices. It processes the data and stores it in the database.

Usage:
    python mqtt_listener.py
"""

import asyncio
import json
import signal
import sys
from datetime import datetime
from typing import Optional

import paho.mqtt.client as mqtt

# Add the current directory to Python path to import our modules
sys.path.append('.')

from core.config import settings
from core.database import db
from db.schemas import TelemetryPayload, LocationPoint
from services.iot_service import iot_service

class MQTTTelemetryListener:
    """MQTT client for listening to IoT telemetry data"""
    
    def __init__(self):
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.running = False
        self.loop: Optional[asyncio.AbstractEventLoop] = None
        
        # Configure MQTT client
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
        # Set up authentication if configured
        if settings.MQTT_USERNAME and settings.MQTT_PASSWORD:
            self.client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)
    
    def on_connect(self, client, userdata, flags, reason_code, properties):
        """Callback for when the client receives a CONNACK response"""
        if reason_code == 0:
            print(f"✅ Connected to MQTT broker at {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
            
            # Subscribe to telemetry topics
            # Pattern: telemetry/{device_id}
            client.subscribe("telemetry/+", qos=1)
            print("📡 Subscribed to telemetry/+ topic")
        else:
            print(f"❌ Failed to connect to MQTT broker, return code {reason_code}")
    
    def on_disconnect(self, client, userdata, flags, reason_code, properties):
        """Callback for when the client disconnects"""
        print(f"🔌 Disconnected from MQTT broker, return code {reason_code}")
    
    def on_message(self, client, userdata, msg):
        """Callback for when a message is received"""
        try:
            # Parse topic to extract device_id
            topic_parts = msg.topic.split('/')
            if len(topic_parts) != 2 or topic_parts[0] != 'telemetry':
                print(f"⚠️ Invalid topic format: {msg.topic}")
                return
            
            device_id = topic_parts[1]
            
            # Parse JSON payload
            payload_str = msg.payload.decode('utf-8')
            payload_dict = json.loads(payload_str)
            
            # Add device_id to payload
            payload_dict['device_id'] = device_id
            
            # Process the telemetry data asynchronously on the main event loop
            if self.loop:
                asyncio.run_coroutine_threadsafe(self.process_telemetry(payload_dict), self.loop)
            else:
                print("⚠️ Event loop not initialized; dropping message")
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON payload: {e}")
        except Exception as e:
            print(f"❌ Error processing message: {e}")
    
    async def process_telemetry(self, payload_dict: dict):
        """Process telemetry data asynchronously"""
        try:
            # Convert dict to TelemetryPayload
            if 'location' in payload_dict and payload_dict['location']:
                location_data = payload_dict['location']
                if isinstance(location_data, dict) and 'latitude' in location_data and 'longitude' in location_data:
                    payload_dict['location'] = LocationPoint(
                        latitude=location_data['latitude'],
                        longitude=location_data['longitude']
                    )
                else:
                    payload_dict['location'] = None
            
            # Convert timestamp if present
            if 'timestamp' in payload_dict and payload_dict['timestamp']:
                if isinstance(payload_dict['timestamp'], str):
                    payload_dict['timestamp'] = datetime.fromisoformat(payload_dict['timestamp'].replace('Z', '+00:00'))
            
            telemetry = TelemetryPayload(**payload_dict)
            
            # Ingest telemetry data
            success = await iot_service.ingest_telemetry(telemetry)
            
            if success:
                print(f"✅ Processed telemetry for device {telemetry.device_id}")
            else:
                print(f"❌ Failed to process telemetry for device {telemetry.device_id}")
                
        except Exception as e:
            print(f"❌ Error processing telemetry data: {e}")
    
    async def start(self):
        """Start the MQTT listener"""
        try:
            # Connect to database (use global db used across services)
            await db.connect()

            # Capture the running event loop for cross-thread scheduling
            self.loop = asyncio.get_running_loop()
            
            # Connect to MQTT broker
            self.client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
            
            # Start the network loop in a separate thread
            self.client.loop_start()
            
            self.running = True
            print("🚀 MQTT telemetry listener started")
            
            # Keep the script running
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            print(f"❌ Error starting MQTT listener: {e}")
            await self.stop()
    
    async def stop(self):
        """Stop the MQTT listener"""
        print("⏹️ Stopping MQTT telemetry listener...")
        
        self.running = False
        
        # Disconnect from MQTT broker
        self.client.loop_stop()
        self.client.disconnect()
        
        # Disconnect from database
        await db.disconnect()
        
        print("✅ MQTT telemetry listener stopped")

# Global listener instance
listener = MQTTTelemetryListener()

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print(f"\n📡 Received signal {signum}, shutting down...")
    asyncio.create_task(listener.stop())

async def main():
    """Main function"""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        await listener.start()
    except KeyboardInterrupt:
        await listener.stop()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        await listener.stop()

if __name__ == "__main__":
    print("🔄 Starting PCIP MQTT Telemetry Listener")
    print(f"📡 MQTT Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
    print(f"🗄️ Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    print("\nPress Ctrl+C to stop\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)

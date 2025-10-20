import asyncio
import json
from typing import Dict, Set
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)

class WebSocketConnectionManager:
    """Manages WebSocket connections for real-time notifications"""
    
    def __init__(self):
        # Store connections by CHC ID
        self.chc_connections: Dict[str, Set[WebSocket]] = {}
        # Store connections by user ID for individual notifications
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()
    
    async def connect_chc(self, websocket: WebSocket, chc_id: str):
        """Connect a WebSocket for CHC notifications"""
        await websocket.accept()
        
        async with self._lock:
            if chc_id not in self.chc_connections:
                self.chc_connections[chc_id] = set()
            self.chc_connections[chc_id].add(websocket)
        
        logger.info(f"CHC {chc_id} WebSocket connected. Total connections: {len(self.chc_connections[chc_id])}")
    
    async def connect_user(self, websocket: WebSocket, user_id: str):
        """Connect a WebSocket for user notifications"""
        await websocket.accept()
        
        async with self._lock:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
        
        logger.info(f"User {user_id} WebSocket connected. Total connections: {len(self.user_connections[user_id])}")
    
    async def disconnect_chc(self, websocket: WebSocket, chc_id: str):
        """Disconnect a CHC WebSocket"""
        async with self._lock:
            if chc_id in self.chc_connections:
                self.chc_connections[chc_id].discard(websocket)
                if not self.chc_connections[chc_id]:
                    del self.chc_connections[chc_id]
        
        logger.info(f"CHC {chc_id} WebSocket disconnected")
    
    async def disconnect_user(self, websocket: WebSocket, user_id: str):
        """Disconnect a user WebSocket"""
        async with self._lock:
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
        
        logger.info(f"User {user_id} WebSocket disconnected")
    
    async def send_to_chc(self, chc_id: str, message: dict):
        """Send message to all CHC WebSocket connections"""
        if chc_id not in self.chc_connections:
            logger.warning(f"No WebSocket connections found for CHC {chc_id}")
            return
        
        message_json = json.dumps(message)
        connections_to_remove = []
        
        for websocket in self.chc_connections[chc_id]:
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending message to CHC {chc_id}: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        if connections_to_remove:
            async with self._lock:
                for websocket in connections_to_remove:
                    self.chc_connections[chc_id].discard(websocket)
                if not self.chc_connections[chc_id]:
                    del self.chc_connections[chc_id]
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send message to all user WebSocket connections"""
        if user_id not in self.user_connections:
            logger.warning(f"No WebSocket connections found for user {user_id}")
            return
        
        message_json = json.dumps(message)
        connections_to_remove = []
        
        for websocket in self.user_connections[user_id]:
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        if connections_to_remove:
            async with self._lock:
                for websocket in connections_to_remove:
                    self.user_connections[user_id].discard(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
    
    async def broadcast_to_all_chcs(self, message: dict):
        """Broadcast message to all CHC connections"""
        if not self.chc_connections:
            return
        
        tasks = []
        for chc_id in list(self.chc_connections.keys()):
            tasks.append(self.send_to_chc(chc_id, message))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def get_connection_stats(self) -> dict:
        """Get statistics about active connections"""
        async with self._lock:
            return {
                "total_chc_connections": sum(len(connections) for connections in self.chc_connections.values()),
                "total_user_connections": sum(len(connections) for connections in self.user_connections.values()),
                "active_chcs": len(self.chc_connections),
                "active_users": len(self.user_connections),
                "chc_details": {chc_id: len(connections) for chc_id, connections in self.chc_connections.items()},
                "user_details": {user_id: len(connections) for user_id, connections in self.user_connections.items()}
            }

# Global WebSocket manager instance
websocket_manager = WebSocketConnectionManager()
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict, Any
import json
import asyncio
from ...core.dependencies import get_optional_user
from ...models import schemas
from datetime import datetime

router = APIRouter()


class ConnectionManager:
    """WebSocket connection manager for real-time updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected connections
                self.active_connections.remove(connection)
    
    async def send_to_user(self, user_id: int, message: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove disconnected connections
                    self.user_connections[user_id].remove(connection)


manager = ConnectionManager()


@router.websocket("/live-data")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time data updates"""
    await manager.connect(websocket)
    
    try:
        # Send welcome message
        welcome_message = schemas.WebSocketMessage(
            type="connection",
            payload={"status": "connected", "message": "Welcome to InsightDash live updates"},
            timestamp=datetime.now()
        )
        await manager.send_personal_message(welcome_message.json(), websocket)
        
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "subscribe":
                # Subscribe to specific dataset updates
                dataset_id = message_data.get("dataset_id")
                response = {
                    "type": "subscription_confirmed",
                    "payload": {"dataset_id": dataset_id, "status": "subscribed"},
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(json.dumps(response), websocket)
                
            elif message_data.get("type") == "ping":
                # Respond to ping with pong
                pong_response = {
                    "type": "pong",
                    "payload": {"timestamp": datetime.now().isoformat()},
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(json.dumps(pong_response), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def broadcast_data_update(dataset_id: int, data: Dict[str, Any]):
    """Broadcast data update to all connected clients"""
    message = schemas.WebSocketMessage(
        type="data_update",
        payload={
            "dataset_id": dataset_id,
            "data": data,
            "timestamp": datetime.now().isoformat()
        },
        timestamp=datetime.now()
    )
    await manager.broadcast(message.json())


async def broadcast_forecast_update(dataset_id: int, forecast_data: Dict[str, Any]):
    """Broadcast forecast completion to all connected clients"""
    message = schemas.WebSocketMessage(
        type="forecast_complete",
        payload={
            "dataset_id": dataset_id,
            "forecast": forecast_data,
            "timestamp": datetime.now().isoformat()
        },
        timestamp=datetime.now()
    )
    await manager.broadcast(message.json())


# Background task to simulate real-time data updates
async def simulate_real_time_data():
    """Simulate real-time data updates (for demo purposes)"""
    import random
    
    while True:
        # Simulate data update every 30 seconds
        await asyncio.sleep(30)
        
        sample_data = {
            "dataset_id": 1,
            "value": random.uniform(10, 100),
            "category": random.choice(["A", "B", "C"]),
            "timestamp": datetime.now().isoformat()
        }
        
        await broadcast_data_update(1, sample_data)


# Start background task (in production, this would be triggered by actual data sources)
# asyncio.create_task(simulate_real_time_data())

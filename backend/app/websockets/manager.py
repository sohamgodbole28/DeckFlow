import json
import asyncio
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("deckflow.ws")

class ConnectionManager:
    def __init__(self):
        # Store connections. e.g., {"desktop_agent": ws, "device_uuid": ws}
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].close()
            except Exception:
                pass
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    def is_agent_connected(self) -> bool:
        return "desktop_agent" in self.active_connections

    async def send_event(self, client_id: str, event: str, data: Dict[str, Any]):
        if client_id in self.active_connections:
            ws = self.active_connections[client_id]
            payload = {"event": event, "data": data}
            try:
                await ws.send_text(json.dumps(payload))
            except Exception as e:
                logger.error(f"Error sending to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast(self, event: str, data: Dict[str, Any]):
        payload = {"event": event, "data": data}
        message = json.dumps(payload)
        disconnected = []
        for client_id, ws in self.active_connections.items():
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(client_id)
        
        for client_id in disconnected:
            self.disconnect(client_id)

manager = ConnectionManager()

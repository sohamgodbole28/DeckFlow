from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
import asyncio
import os

from app.database import engine, Base, SessionLocal
from app.models import models
from app.api.api import api_router
from app.websockets.manager import manager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeckFlow API", description="Backend for DeckFlow Stream Deck replacement")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local network usage
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    
    if client_id != "desktop_agent":
        db = SessionLocal()
        try:
            device = db.query(models.Device).filter(models.Device.uuid == client_id).first()
            if not device:
                from datetime import datetime, timezone
                
                # Auto-approve local development traffic (e.g. localhost browser) and the Desktop Agent.
                # Remote network devices (e.g., 192.168.x.x) must continue requiring manual 
                # approval in the Controller UI to prevent unauthorized access.
                is_local = websocket.client.host in {"127.0.0.1", "::1", "localhost"}
                
                print(f"[DEBUG] New device connected: {client_id}, host: {websocket.client.host}, is_local: {is_local}")
                new_device = models.Device(uuid=client_id, approved=is_local, last_seen=datetime.now(timezone.utc))
                db.add(new_device)
                db.commit()
            else:
                from datetime import datetime, timezone
                print(f"[DEBUG] Existing device connected: {client_id}, approved: {device.approved}")
                device.last_seen = datetime.now(timezone.utc)
                db.commit()
        finally:
            db.close()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                event = message.get("event")
                payload = message.get("data", {})
                
                if event == "ping":
                    await manager.send_event(client_id, "pong", {})
                
                elif event == "button.press":
                    # Forward to desktop agent
                    button_id = payload.get("button_id")
                    print(f"[DEBUG] WS button.press received from {client_id} for button {button_id}")
                    
                    
                    db = SessionLocal()
                    try:
                        # Check authorization
                        device = db.query(models.Device).filter(models.Device.uuid == client_id).first()
                        if not device or not device.approved:
                            print(f"[DEBUG] ERROR: Device {client_id} not approved")
                            await manager.send_event(client_id, "error", {"message": "Device not approved"})
                            continue

                        # Fetch actions from DB
                        actions = db.query(models.ButtonAction).filter(models.ButtonAction.button_id == button_id).order_by(models.ButtonAction.order_index).all()
                        
                        action_list = []
                        for action in actions:
                            action_list.append({
                                "type": action.type,
                                "config": action.config
                            })
                    finally:
                        db.close()
                    
                    # Send to desktop agent
                    await manager.send_event("desktop_agent", "actions.execute", {
                        "button_id": button_id,
                        "actions": action_list
                    })
                
                elif event == "execution.status":
                    # Save to log
                    db = SessionLocal()
                    try:
                        log_entry = models.ExecutionLog(
                            button_id=payload.get("button_id"),
                            device_id=client_id, # "desktop_agent"
                            status=payload.get("status"),
                            duration_ms=payload.get("duration_ms", 0),
                            message=payload.get("message")
                        )
                        db.add(log_entry)
                        db.commit()
                    finally:
                        db.close()
                    
                    # Broadcast status to UI
                    await manager.broadcast("status.update", payload)
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "agent_connected": manager.is_agent_connected()
    }

# SPA Static Files (Production Mode)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.isdir(frontend_dist):
    # Mount assets directory directly
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(path) and os.path.isfile(path):
            return FileResponse(path)
        response = FileResponse(os.path.join(frontend_dist, "index.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return response


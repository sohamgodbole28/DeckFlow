import asyncio
import json
import websockets
import websockets.exceptions
import time
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from actions.keyboard import execute_keyboard
from actions.mouse import execute_mouse
from actions.launcher import execute_launcher
from actions.shell import execute_shell
from actions.media import execute_media
from actions.system import execute_system
from actions.http import execute_http

SERVER_URI = "ws://localhost:8000/ws/desktop_agent"

class DesktopAgent:
    def __init__(self):
        self.ws = None

    async def connect(self):
        while True:
            try:
                logging.info(f"Connecting to {SERVER_URI}...")
                async with websockets.connect(SERVER_URI) as ws:
                    self.ws = ws
                    logging.info("Connected!")
                    
                    # Start heartbeat task
                    heartbeat_task = asyncio.create_task(self.heartbeat())
                    
                    try:
                        async for message in ws:
                            await self.handle_message(message)
                    except websockets.exceptions.ConnectionClosed:
                        logging.warning("Connection closed. Reconnecting...")
                    finally:
                        heartbeat_task.cancel()
            except Exception as e:
                logging.error(f"Connection failed: {e}. Retrying in 3 seconds...")
                await asyncio.sleep(3)

    async def heartbeat(self):
        while True:
            try:
                await self.send_event("ping", {})
                await asyncio.sleep(5)
            except:
                break

    async def send_event(self, event: str, data: Dict[str, Any]):
        if self.ws:
            payload = {"event": event, "data": data}
            await self.ws.send(json.dumps(payload))

    async def handle_message(self, message: str):
        try:
            data = json.loads(message)
            event = data.get("event")
            payload = data.get("data", {})

            if event == "pong":
                pass # Heartbeat ack
                
            elif event == "actions.execute":
                button_id = payload.get("button_id")
                actions = payload.get("actions", [])
                logging.info(f"RECEIVED ACTIONS.EXECUTE: {json.dumps(payload)}")
                
                start_time = time.time()
                status = "success"
                msg = "Actions executed successfully"
                
                try:
                    for action in actions:
                        if action.get("type") == "DELAY":
                            delay_val = action.get("config", {}).get("duration_ms", 0)
                            if delay_val > 0:
                                await asyncio.sleep(delay_val / 1000.0)
                            continue

                        await asyncio.to_thread(self.execute_action, action)
                except Exception as e:
                    status = "error"
                    msg = str(e)
                    logging.error(f"Execution error: {msg}")
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                # Send result back
                await self.send_event("execution.status", {
                    "button_id": button_id,
                    "status": status,
                    "message": msg,
                    "duration_ms": duration_ms
                })
                
        except json.JSONDecodeError:
            logging.error("Received invalid JSON")
        except Exception as e:
            logging.error(f"Error handling message: {e}")

    def execute_action(self, action: Dict[str, Any]):
        raw_type = action.get("type", "")
        config = action.get("config", {})
        
        # Handle Quick Action mapping from frontend ActionRegistry
        # e.g., MEDIA_KEYS:play_pause -> action_type = MEDIA_KEYS, config = {"action": "play_pause"}
        if ":" in raw_type:
            action_type, sub_action = raw_type.split(":", 1)
            
            if action_type == "MOUSE_CLICK":
                if sub_action == "double":
                    config["action"] = "double_click"
                    config["button"] = "left"
                else:
                    config["action"] = "click"
                    config["button"] = sub_action
            elif action_type == "MEDIA_KEYS":
                if sub_action == "next_track":
                    config["action"] = "next"
                elif sub_action == "prev_track":
                    config["action"] = "previous"
                else:
                    config["action"] = sub_action
            elif action_type == "VOLUME_CONTROLS":
                if sub_action == "volume_mute":
                    config["action"] = "mute"
                else:
                    config["action"] = sub_action
            else:
                config["action"] = sub_action
        else:
            action_type = raw_type
        
        if action_type == "RUN_COMMAND" and config.get("shell") == "powershell":
            action_type = "RUN_POWERSHELL"
            
        if action_type == "KEYBOARD_SHORTCUT":
            keys = []
            if config.get("ctrl"): keys.append("ctrl")
            if config.get("shift"): keys.append("shift")
            if config.get("alt"): keys.append("alt")
            if config.get("win"): keys.append("cmd")
            key_val = config.get("key")
            if key_val:
                # Map special keys from frontend to pynput Key attributes
                special_maps = {
                    "escape": "esc", "arrowup": "up", "arrowdown": "down",
                    "arrowleft": "left", "arrowright": "right", "pagedown": "page_down",
                    "pageup": "page_up", "delete": "delete", "insert": "insert",
                    "home": "home", "end": "end", "backspace": "backspace",
                    "enter": "enter", "tab": "tab", "space": "space"
                }
                k_low = key_val.lower()
                if k_low in special_maps:
                    keys.append(special_maps[k_low])
                else:
                    keys.append(k_low)
            config["keys"] = keys
            execute_keyboard(config)
        elif action_type == "MOUSE_CLICK":
            execute_mouse(config)
        elif action_type == "OPEN_WEBSITE":
            target = config.get("target", "")
            if not target.startswith("http://") and not target.startswith("https://"):
                config["target"] = "https://" + target
            execute_launcher(config)
        elif action_type in ["LAUNCH_APPLICATION", "OPEN_FILE", "OPEN_FOLDER"]:
            execute_launcher(config)
        elif action_type == "RUN_COMMAND" or action_type == "RUN_POWERSHELL" or action_type == "RUN_PYTHON_SCRIPT":
            execute_shell(action_type, config)
        elif action_type == "MEDIA_KEYS" or action_type == "VOLUME_CONTROLS":
            execute_media(action_type, config)
        elif action_type == "SYSTEM_CONTROL":
            execute_system(config)
        elif action_type == "HTTP_REQUEST":
            execute_http(config)
        else:
            raise ValueError(f"Unknown action type: {action_type}")

if __name__ == "__main__":
    agent = DesktopAgent()
    asyncio.run(agent.connect())

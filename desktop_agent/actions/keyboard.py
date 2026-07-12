from pynput.keyboard import Controller, Key
import time

keyboard = Controller()

def execute_keyboard(config: dict):
    keys = config.get("keys", [])
    
    parsed_keys = []
    for k in keys:
        k_lower = k.lower()
        if hasattr(Key, k_lower):
            parsed_keys.append(getattr(Key, k_lower))
        else:
            parsed_keys.append(k)
            
    # Press all
    for k in parsed_keys:
        keyboard.press(k)
        
    # Release all in reverse order
    for k in reversed(parsed_keys):
        keyboard.release(k)

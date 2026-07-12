from pynput.keyboard import Controller, Key

keyboard = Controller()

def execute_media(action_type: str, config: dict):
    action = config.get("action")
    if not action:
        raise ValueError("No media action specified")
        
    if action_type == "MEDIA_KEYS":
        if action == "play_pause":
            keyboard.press(Key.media_play_pause)
            keyboard.release(Key.media_play_pause)
        elif action == "next":
            keyboard.press(Key.media_next)
            keyboard.release(Key.media_next)
        elif action == "previous":
            keyboard.press(Key.media_previous)
            keyboard.release(Key.media_previous)
            
    elif action_type == "VOLUME_CONTROLS":
        if action == "volume_up":
            keyboard.press(Key.media_volume_up)
            keyboard.release(Key.media_volume_up)
        elif action == "volume_down":
            keyboard.press(Key.media_volume_down)
            keyboard.release(Key.media_volume_down)
        elif action == "mute":
            keyboard.press(Key.media_volume_mute)
            keyboard.release(Key.media_volume_mute)

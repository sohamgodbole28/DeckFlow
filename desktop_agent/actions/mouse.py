import pyautogui

def execute_mouse(config: dict):
    action = config.get("action", "click")
    x = config.get("x")
    y = config.get("y")
    button = config.get("button", "left")
    
    if action == "click":
        if x is not None and y is not None:
            pyautogui.click(x=x, y=y, button=button)
        else:
            pyautogui.click(button=button)
    elif action == "double_click":
        if x is not None and y is not None:
            pyautogui.doubleClick(x=x, y=y, button=button)
        else:
            pyautogui.doubleClick(button=button)
    elif action == "move":
        if x is not None and y is not None:
            pyautogui.moveTo(x, y)

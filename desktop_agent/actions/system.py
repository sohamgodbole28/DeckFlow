import os
import subprocess
import ctypes

def execute_system(config: dict):
    action = config.get("action")
    if not action:
        raise ValueError("No system action specified")
        
    if action == "lock":
        ctypes.windll.user32.LockWorkStation()
    elif action == "sleep":
        os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
    elif action == "restart":
        os.system("shutdown /r /t 0")
    elif action == "shutdown":
        os.system("shutdown /s /t 0")

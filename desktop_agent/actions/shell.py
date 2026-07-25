import subprocess

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

def execute_shell(action_type: str, config: dict):
    command = config.get("command")
    if not command:
        raise ValueError("No command specified")
        
    creationflags = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
        
    if action_type == "RUN_COMMAND":
        subprocess.Popen(command, shell=True, creationflags=creationflags)
    elif action_type == "RUN_POWERSHELL":
        subprocess.Popen(["powershell", "-Command", command], creationflags=creationflags)
    elif action_type == "RUN_PYTHON_SCRIPT":
        subprocess.Popen(["python", command], creationflags=creationflags)

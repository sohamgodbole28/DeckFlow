import subprocess

def execute_shell(action_type: str, config: dict):
    command = config.get("command")
    if not command:
        raise ValueError("No command specified")
        
    if action_type == "RUN_COMMAND":
        subprocess.Popen(command, shell=True)
    elif action_type == "RUN_POWERSHELL":
        subprocess.Popen(["powershell", "-Command", command])
    elif action_type == "RUN_PYTHON_SCRIPT":
        subprocess.Popen(["python", command])

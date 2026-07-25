import os
import webbrowser
import subprocess

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

def execute_launcher(config: dict):
    target = config.get("target")
    if not target:
        raise ValueError("No target specified for launcher")
        
    if target.startswith("http://") or target.startswith("https://"):
        webbrowser.open(target)
    else:
        args = config.get("arguments", "")
        cwd = config.get("cwd", "")
        if not cwd:
            cwd = None
            
        if args or cwd:
            import shlex
            cmd = f'"{target}" {args}'
            subprocess.Popen(cmd, cwd=cwd, shell=True, creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP)
        else:
            # Launch application or open file natively
            os.startfile(target)

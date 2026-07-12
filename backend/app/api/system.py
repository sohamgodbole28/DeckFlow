from fastapi import APIRouter
import os
from pathlib import Path

router = APIRouter()

@router.get("/apps")
def get_installed_apps():
    apps = []
    
    # Common Start Menu paths
    paths = [
        os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs"),
        os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs")
    ]
    
    for base_path in paths:
        if not os.path.exists(base_path):
            continue
            
        for path in Path(base_path).rglob("*.lnk"):
            # Ignore uninstallers or web links usually named 'Uninstall...' or similar if we want to be cleaner
            # For now, just return all shortcuts
            apps.append({
                "name": path.stem,
                "path": str(path)
            })
            
    # Sort and remove duplicates by name
    unique_apps = {}
    for app in apps:
        if app["name"] not in unique_apps:
            unique_apps[app["name"]] = app
            
    result = list(unique_apps.values())
    result.sort(key=lambda x: x["name"].lower())
    return result

from fastapi import APIRouter

from app.api import profiles, pages, buttons, actions, devices, settings, logs, system

api_router = APIRouter()

api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(pages.router, prefix="/pages", tags=["pages"])
api_router.include_router(buttons.router, prefix="/buttons", tags=["buttons"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(system.router, prefix="/system", tags=["system"])

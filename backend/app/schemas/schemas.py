from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Settings ---
class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class Setting(SettingBase):
    class Config:
        orm_mode = True
        from_attributes = True

# --- Actions ---
class ButtonActionBase(BaseModel):
    type: str
    config: Dict[str, Any]
    order_index: int = 0

class ButtonActionCreate(ButtonActionBase):
    pass

class ButtonActionUpdate(BaseModel):
    type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = None

class ButtonAction(ButtonActionBase):
    id: int
    button_id: int

    class Config:
        orm_mode = True
        from_attributes = True

# --- Buttons ---
class ButtonBase(BaseModel):
    label: Optional[str] = None
    icon: Optional[str] = None
    emoji: Optional[str] = None
    x: int = 0
    y: int = 0
    width: int = 1
    height: int = 1
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    icon_size: Optional[int] = None
    requires_confirmation: bool = False
    is_enabled: bool = True

class ButtonCreate(ButtonBase):
    pass

class ButtonUpdate(BaseModel):
    label: Optional[str] = None
    icon: Optional[str] = None
    emoji: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    icon_size: Optional[int] = None
    requires_confirmation: Optional[bool] = None
    is_enabled: Optional[bool] = None

class Button(ButtonBase):
    id: int
    page_id: int
    actions: List[ButtonAction] = []

    class Config:
        orm_mode = True
        from_attributes = True

# --- Pages ---
class PageBase(BaseModel):
    name: str
    order_index: int = 0

class PageCreate(PageBase):
    pass

class PageUpdate(BaseModel):
    name: Optional[str] = None
    order_index: Optional[int] = None

class Page(PageBase):
    id: int
    profile_id: int
    buttons: List[Button] = []

    class Config:
        orm_mode = True
        from_attributes = True

# --- Profiles ---
class ProfileBase(BaseModel):
    name: str
    grid_rows: int = 3
    grid_cols: int = 5
    default_page_id: Optional[int] = None
    is_default: bool = False

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    grid_rows: Optional[int] = None
    grid_cols: Optional[int] = None
    default_page_id: Optional[int] = None
    is_default: Optional[bool] = None

class Profile(ProfileBase):
    id: int
    created_at: datetime
    pages: List[Page] = []

    class Config:
        orm_mode = True
        from_attributes = True

# --- Devices ---
class DeviceBase(BaseModel):
    uuid: str
    name: Optional[str] = None
    approved: bool = False
    ip_address: Optional[str] = None
    connected: bool = False

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    approved: Optional[bool] = None

class Device(DeviceBase):
    id: int
    last_seen: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

# --- Execution Logs ---
class ExecutionLogBase(BaseModel):
    button_id: int
    device_id: Optional[str] = None
    status: str
    duration_ms: int = 0
    message: Optional[str] = None

class ExecutionLogCreate(ExecutionLogBase):
    pass

class ExecutionLog(ExecutionLogBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
        from_attributes = True

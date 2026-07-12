from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    grid_rows = Column(Integer, default=3)
    grid_cols = Column(Integer, default=5)
    default_page_id = Column(Integer, ForeignKey("pages.id"), nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pages = relationship("Page", back_populates="profile", cascade="all, delete-orphan", foreign_keys="[Page.profile_id]")


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    name = Column(String, nullable=False)
    order_index = Column(Integer, default=0)

    profile = relationship("Profile", back_populates="pages", foreign_keys=[profile_id])
    buttons = relationship("Button", back_populates="page", cascade="all, delete-orphan")


class Button(Base):
    __tablename__ = "buttons"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=False)
    label = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    emoji = Column(String, nullable=True)
    
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    width = Column(Integer, default=1)
    height = Column(Integer, default=1)
    
    background_color = Column(String, nullable=True)
    text_color = Column(String, nullable=True)
    icon_size = Column(Integer, nullable=True)
    
    requires_confirmation = Column(Boolean, default=False)
    is_enabled = Column(Boolean, default=True)

    page = relationship("Page", back_populates="buttons")
    actions = relationship("ButtonAction", back_populates="button", cascade="all, delete-orphan")


class ButtonAction(Base):
    __tablename__ = "button_actions"

    id = Column(Integer, primary_key=True, index=True)
    button_id = Column(Integer, ForeignKey("buttons.id"), nullable=False)
    type = Column(String, nullable=False)  # KEYBOARD_SHORTCUT, MOUSE_CLICK, etc.
    config = Column(JSON, nullable=False)
    order_index = Column(Integer, default=0)

    button = relationship("Button", back_populates="actions")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    approved = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String, nullable=True)
    connected = Column(Boolean, default=False)


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    button_id = Column(Integer, ForeignKey("buttons.id"), nullable=False)
    device_id = Column(String, nullable=True)
    status = Column(String, nullable=False)  # success / error
    duration_ms = Column(Integer, default=0)
    message = Column(String, nullable=True)


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=True)

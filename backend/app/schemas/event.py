from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.event import EventStatus


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Event title")
    slug: str = Field(..., min_length=1, max_length=255, description="URL slug")
    short_description: Optional[str] = Field(None, description="Brief summary of event")
    description: Optional[str] = Field(None, description="Detailed event description")
    hero_media: Optional[str] = Field(None, max_length=1024, description="Hero media artwork URL")
    event_type: str = Field("performance", max_length=64, description="Event format type")
    status: EventStatus = Field(EventStatus.DRAFT, description="Event lifecycle state")
    start_date: datetime = Field(..., description="Event start timestamp")
    end_date: Optional[datetime] = Field(None, description="Event conclusion timestamp")
    time_display: Optional[str] = Field(None, max_length=100, description="Formatted display time string")
    location: str = Field(..., min_length=1, max_length=255, description="Venue or location")
    venue_details: Optional[str] = Field(None, description="Venue address and access information")
    is_online: bool = Field(False, description="Whether event takes place online/virtually")
    featured: bool = Field(False, description="Whether highlighted on events showcase")
    storyteller_name: Optional[str] = Field(None, max_length=255, description="Featured storyteller/speaker")
    schedule: List[Dict[str, Any]] = Field(default_factory=list, description="Structured agenda / timeline")
    ticket_info: Optional[str] = Field(None, max_length=255, description="Informational ticketing notes")
    registration_url: Optional[str] = Field(None, max_length=1024, description="External registration URL")
    capacity: Optional[int] = Field(None, ge=1, description="Venue attendee capacity")


class EventCreate(EventBase):
    """Payload schema for creating an Event."""
    pass


class EventUpdate(BaseModel):
    """Payload schema for modifying an Event."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: Optional[str] = None
    hero_media: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[EventStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    time_display: Optional[str] = None
    location: Optional[str] = None
    venue_details: Optional[str] = None
    is_online: Optional[bool] = None
    featured: Optional[bool] = None
    storyteller_name: Optional[str] = None
    schedule: Optional[List[Dict[str, Any]]] = None
    ticket_info: Optional[str] = None
    registration_url: Optional[str] = None
    capacity: Optional[int] = None


class EventSummaryResponse(BaseModel):
    """Lightweight response schema for listing events."""
    id: str
    title: str
    slug: str
    short_description: Optional[str] = None
    hero_media: Optional[str] = None
    event_type: str
    status: EventStatus
    start_date: datetime
    end_date: Optional[datetime] = None
    time_display: Optional[str] = None
    location: str
    is_online: bool
    featured: bool
    storyteller_name: Optional[str] = None
    ticket_info: Optional[str] = None
    registration_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventResponse(EventSummaryResponse):
    """Complete detail response schema for a single event."""
    description: Optional[str] = None
    venue_details: Optional[str] = None
    schedule: List[Dict[str, Any]] = Field(default_factory=list)
    capacity: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

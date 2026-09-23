from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactCreate(BaseModel):
    """Payload schema for submitting a contact or booking enquiry."""
    name: str = Field(..., min_length=2, max_length=255, description="Sender's full name")
    email: EmailStr = Field(..., description="Valid contact email address")
    phone: Optional[str] = Field(None, max_length=50, description="Optional phone number")
    enquiry_type: str = Field(
        "General Enquiry",
        max_length=100,
        description="Category of enquiry",
        validation_alias="enquiryType",
    )
    message: str = Field(..., min_length=10, description="Enquiry body message")

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "name": "Maya Raman",
                "email": "maya@example.com",
                "phone": "+44 20 7946 0912",
                "enquiry_type": "Performance / Booking",
                "message": "We would love to organise a live Ramayana storytelling performance at our heritage festival.",
            }
        },
    )


class ContactResponse(BaseModel):
    """Response returned upon successful contact submission."""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    enquiry_type: str
    message: str
    status: str
    created_at: datetime
    confirmation: str = Field(
        "Thank you for reaching out to StoryHour. Your enquiry has been received.",
        description="User-facing submission confirmation note",
    )

    model_config = ConfigDict(from_attributes=True)

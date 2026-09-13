from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    product_type: str = Field(default="digital", min_length=1, max_length=50)
    is_active: bool = True

    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    product_type: Optional[str] = Field(None, min_length=1, max_length=50)
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    currency: str
    product_type: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

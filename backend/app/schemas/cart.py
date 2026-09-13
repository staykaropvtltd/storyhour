from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    product_id: str = Field(..., min_length=1, max_length=36)
    quantity: int = Field(..., ge=1)

    model_config = ConfigDict(extra="forbid")


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

    model_config = ConfigDict(extra="forbid")


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: Decimal
    currency: str
    line_total: Decimal

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: str
    user_id: str
    status: str
    items: List[CartItemResponse]
    subtotal: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

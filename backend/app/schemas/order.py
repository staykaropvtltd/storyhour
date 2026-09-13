from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    unit_price: Decimal
    currency: str
    quantity: int
    line_total: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    user_id: str
    status: str
    currency: str
    subtotal: Decimal
    total: Decimal
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]

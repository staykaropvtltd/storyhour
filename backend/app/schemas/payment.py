from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentResponse(BaseModel):
    """Payment status returned to the authenticated customer."""

    id: str
    order_id: str
    status: str
    stage_1_status: str
    stage_2_status: str
    stage_3_status: str
    amount: Decimal
    currency: str
    provider_reference: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentStageRequest(BaseModel):
    """Optional provider reference supplied when completing a payment stage."""

    provider_reference: str | None = Field(
        default=None,
        max_length=255,
    )

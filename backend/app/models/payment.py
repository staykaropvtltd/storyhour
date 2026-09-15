from decimal import Decimal
from enum import Enum

from sqlalchemy import Column, ForeignKey, Numeric, String, UniqueConstraint

from app.database.base import BaseSaaSModel


class PaymentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class PaymentStageStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Payment(BaseSaaSModel):
    __tablename__ = "payments"

    order_id = Column(
        String(36),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default=PaymentStatus.PENDING.value,
        index=True,
    )

    stage_1_status = Column(
        String(20),
        nullable=False,
        default=PaymentStageStatus.PENDING.value,
    )

    stage_2_status = Column(
        String(20),
        nullable=False,
        default=PaymentStageStatus.PENDING.value,
    )

    stage_3_status = Column(
        String(20),
        nullable=False,
        default=PaymentStageStatus.PENDING.value,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    currency = Column(
        String(3),
        nullable=False,
    )

    provider_reference = Column(
        String(255),
        nullable=True,
        index=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "order_id",
            name="uq_payments_order_id",
        ),
    )

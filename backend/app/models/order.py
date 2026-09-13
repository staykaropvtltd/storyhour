from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint
)

from app.database.base import BaseSaaSModel, SoftDeleteMixin


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Order(BaseSaaSModel, SoftDeleteMixin):
    __tablename__ = "orders"

    user_id = Column(String(36), nullable=False, index=True)
    status = Column(
        String(20),
        nullable=False,
        default=OrderStatus.PENDING.value,
        index=True,
    )
    currency = Column(String(3), nullable=False)
    subtotal = Column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    total = Column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )


class OrderItem(BaseSaaSModel, SoftDeleteMixin):
    __tablename__ = "order_items"

    order_id = Column(
        String(36),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        String(36),
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )
    product_name = Column(String(255), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "order_id",
            "product_id",
            name="uq_order_items_order_product",
        ),
    )

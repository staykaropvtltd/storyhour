from enum import Enum

from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from app.database.base import BaseSaaSModel, SoftDeleteMixin


class CartStatus(str, Enum):
    ACTIVE = "active"
    CONVERTED = "converted"
    ABANDONED = "abandoned"


class Cart(BaseSaaSModel, SoftDeleteMixin):
    __tablename__ = "carts"

    user_id = Column(String(36), nullable=False, index=True)
    status = Column(
        String(20),
        nullable=False,
        default=CartStatus.ACTIVE.value,
        index=True,
    )


class CartItem(BaseSaaSModel, SoftDeleteMixin):
    __tablename__ = "cart_items"

    cart_id = Column(
        String(36),
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        String(36),
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False, default=1)

    __table_args__ = (
        UniqueConstraint(
            "cart_id",
            "product_id",
            name="uq_cart_items_cart_product",
        ),
    )

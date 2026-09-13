from decimal import Decimal

from sqlalchemy import Boolean, Column, Numeric, String, Text

from app.database.base import BaseSaaSModel, SoftDeleteMixin


class Product(BaseSaaSModel, SoftDeleteMixin):
    __tablename__ = "products"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    price = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    currency = Column(String(3), nullable=False, default="INR")
    product_type = Column(String(50), nullable=False, default="digital")

    is_active = Column(Boolean, nullable=False, default=True, index=True)

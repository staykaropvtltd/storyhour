from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.cart import CartRepository
from app.repositories.order import OrderRepository


class OrderService:
    def __init__(
        self,
        order_repo: Optional[OrderRepository] = None,
        cart_repo: Optional[CartRepository] = None,
    ):
        self.order_repo = order_repo or OrderRepository()
        self.cart_repo = cart_repo or CartRepository()

    def create_from_cart(
        self,
        db: Session,
        user_id: str,
    ) -> Order:
        cart = self.cart_repo.get_active_cart(
            db,
            user_id,
        )

        if cart is None:
            raise ValueError("Cart not found")

        cart_items = self.cart_repo.list_items(
            db,
            cart.id,
        )

        if not cart_items:
            raise ValueError("Cart is empty")

        inactive_products = [
            product.name
            for _item, product in cart_items
            if not product.is_active
        ]

        if inactive_products:
            raise ValueError(
                "Cart contains inactive product(s): "
                + ", ".join(inactive_products)
            )

        currencies = {
            product.currency
            for _item, product in cart_items
        }

        if len(currencies) != 1:
            raise ValueError("Cart contains multiple currencies")

        currency = next(iter(currencies))

        subtotal = sum(
            (
                product.price * item.quantity
                for item, product in cart_items
            ),
            Decimal("0.00"),
        )

        try:
            order = Order(
                user_id=user_id,
                status=OrderStatus.PENDING.value,
                currency=currency,
                subtotal=subtotal,
                total=subtotal,
            )

            order = self.order_repo.create_order(
                db,
                order,
            )

            for item, product in cart_items:
                line_total = product.price * item.quantity

                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    unit_price=product.price,
                    currency=product.currency,
                    quantity=item.quantity,
                    line_total=line_total,
                )

                self.order_repo.create_item(
                    db,
                    order_item,
                )

            db.commit()
            db.refresh(order)

            return order

        except Exception:
            db.rollback()
            raise

    def get_order(
        self,
        db: Session,
        user_id: str,
        order_id: str,
    ) -> Order:
        order = self.order_repo.get_by_id(
            db,
            order_id,
        )

        if order is None or order.user_id != user_id:
            raise ValueError("Order not found")

        return order

    def get_order_items(
        self,
        db: Session,
        order_id: str,
    ) -> list[OrderItem]:
        return self.order_repo.get_items(
            db,
            order_id,
        )

    def list_orders(
        self,
        db: Session,
        user_id: str,
    ) -> list[Order]:
        return self.order_repo.get_by_user(
            db,
            user_id,
        )


order_service = OrderService()

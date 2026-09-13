from typing import Optional

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem


class OrderRepository:
    def get_by_id(
        self,
        db: Session,
        order_id: str,
    ) -> Optional[Order]:
        return (
            db.query(Order)
            .filter(
                Order.id == order_id,
                Order.is_deleted.is_(False),
            )
            .first()
        )

    def get_by_user(
        self,
        db: Session,
        user_id: str,
    ) -> list[Order]:
        return (
            db.query(Order)
            .filter(
                Order.user_id == user_id,
                Order.is_deleted.is_(False),
            )
            .order_by(Order.created_at.desc())
            .all()
        )

    def create_order(
        self,
        db: Session,
        order: Order,
    ) -> Order:
        db.add(order)
        db.flush()
        db.refresh(order)
        return order

    def create_item(
        self,
        db: Session,
        item: OrderItem,
    ) -> OrderItem:
        db.add(item)
        db.flush()
        db.refresh(item)
        return item

    def get_items(
        self,
        db: Session,
        order_id: str,
    ) -> list[OrderItem]:
        return (
            db.query(OrderItem)
            .filter(
                OrderItem.order_id == order_id,
                OrderItem.is_deleted.is_(False),
            )
            .order_by(OrderItem.created_at.asc())
            .all()
        )

    def update_order(
        self,
        db: Session,
        order: Order,
    ) -> Order:
        db.commit()
        db.refresh(order)
        return order

    def soft_delete_order(
        self,
        db: Session,
        order: Order,
    ) -> Order:
        order.is_deleted = True
        db.commit()
        db.refresh(order)
        return order


order_repository = OrderRepository()

from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.library import LibraryItem
from app.models.order import Order, OrderItem, OrderStatus


class LibraryRepository(BaseRepository[LibraryItem]):
    """Repository handling database access for User Library entities."""

    def __init__(self):
        super().__init__(LibraryItem)

    def get_user_library(
        self,
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
    ) -> List[LibraryItem]:
        """Fetch active library items for a specific user."""
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.is_active.is_(True),
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_user_library(self, db: Session, user_id: str) -> int:
        """Count total active library items for a user."""
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.is_active.is_(True),
            )
            .count()
        )

    def get_library_item(
        self,
        db: Session,
        user_id: str,
        story_id: str,
    ) -> Optional[LibraryItem]:
        """Fetch a specific library entitlement by user ID and story ID."""
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.story_id == story_id,
                self.model.is_active.is_(True),
            )
            .first()
        )

    def add_to_library(
        self,
        db: Session,
        *,
        user_id: str,
        story_id: str,
        access_type: str = "purchased",
        source_order_id: Optional[str] = None,
    ) -> LibraryItem:
        """Add a story to the user's library or reactivate existing access."""
        item = (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.story_id == story_id,
            )
            .first()
        )
        if item:
            item.is_active = True
            item.access_type = access_type
            if source_order_id:
                item.source_order_id = source_order_id
        else:
            item = LibraryItem(
                user_id=user_id,
                story_id=story_id,
                access_type=access_type,
                is_active=True,
                source_order_id=source_order_id,
            )
            db.add(item)

        db.commit()
        db.refresh(item)
        return item

    def check_confirmed_order_for_product(
        self,
        db: Session,
        user_id: str,
        product_id: str,
    ) -> Optional[str]:
        """
        Check whether the user has a confirmed Order containing the given product_id.
        Returns the order_id if confirmed purchase exists, otherwise None.
        """
        order_item = (
            db.query(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.user_id == user_id,
                Order.status == OrderStatus.CONFIRMED.value,
                OrderItem.product_id == product_id,
            )
            .first()
        )
        return order_item.order_id if order_item else None

from typing import Optional

from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.payment import Payment


class PaymentRepository(BaseRepository[Payment]):
    """Database access for order payments."""

    def __init__(self):
        super().__init__(Payment)

    def get_by_order(
        self,
        db: Session,
        order_id: str,
    ) -> Optional[Payment]:
        """Return the payment associated with an order, if one exists."""
        return (
            db.query(self.model)
            .filter(self.model.order_id == order_id)
            .first()
        )

    def create_payment(
        self,
        db: Session,
        *,
        order_id: str,
        amount,
        currency: str,
    ) -> Payment:
        """Create and flush a new pending payment without committing."""
        payment = Payment(
            order_id=order_id,
            amount=amount,
            currency=currency,
        )
        db.add(payment)
        db.flush()
        db.refresh(payment)
        return payment

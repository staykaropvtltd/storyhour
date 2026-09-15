from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.order import OrderStatus
from app.models.payment import Payment, PaymentStageStatus, PaymentStatus
from app.models.story import Story
from app.repositories.library import LibraryRepository
from app.repositories.order import OrderRepository
from app.repositories.payment import PaymentRepository


class PaymentService:
    """
    Business logic for the three-stage payment lifecycle.

    Transaction ownership intentionally remains here. Repositories only
    flush persistence changes; Stage 3 must commit payment, order, and
    library entitlement atomically.
    """

    def __init__(
        self,
        payment_repo: Optional[PaymentRepository] = None,
        order_repo: Optional[OrderRepository] = None,
        library_repo: Optional[LibraryRepository] = None,
    ):
        self.payment_repo = payment_repo or PaymentRepository()
        self.order_repo = order_repo or OrderRepository()
        self.library_repo = library_repo or LibraryRepository()

    def create_payment(
        self,
        db: Session,
        *,
        user_id: str,
        order_id: str,
    ) -> Payment:
        """Create the single payment record for a pending order."""
        order = self.order_repo.get_by_id(db, order_id)

        if order is None or order.user_id != user_id:
            raise ValueError("Order not found")

        if order.status != OrderStatus.PENDING.value:
            raise ValueError("Payment can only be created for a pending order")

        existing = self.payment_repo.get_by_order(db, order_id)

        if existing is not None:
            raise ValueError("Payment already exists for this order")

        try:
            payment = self.payment_repo.create_payment(
                db,
                order_id=order.id,
                amount=Decimal(order.total),
                currency=order.currency,
            )
            db.commit()
            db.refresh(payment)
            return payment
        except Exception:
            db.rollback()
            raise

    def get_payment(
        self,
        db: Session,
        *,
        user_id: str,
        order_id: str,
    ) -> Payment:
        """Return a user's payment for an order."""
        order = self.order_repo.get_by_id(db, order_id)

        if order is None or order.user_id != user_id:
            raise ValueError("Order not found")

        payment = self.payment_repo.get_by_order(db, order_id)

        if payment is None:
            raise ValueError("Payment not found")

        return payment

    def complete_stage(
        self,
        db: Session,
        *,
        user_id: str,
        order_id: str,
        stage: int,
        provider_reference: Optional[str] = None,
    ) -> Payment:
        """
        Complete one payment stage.

        Stages are strictly ordered:
            Stage 1 -> Stage 2 -> Stage 3

        Repeating an already-completed stage is idempotent.
        """
        if stage not in (1, 2, 3):
            raise ValueError("Payment stage must be 1, 2, or 3")

        order = self.order_repo.get_by_id(db, order_id)

        if order is None or order.user_id != user_id:
            raise ValueError("Order not found")

        payment = self.payment_repo.get_by_order(db, order_id)

        if payment is None:
            raise ValueError("Payment not found")

        if payment.status == PaymentStatus.CONFIRMED.value:
            return payment

        if payment.status == PaymentStatus.FAILED.value:
            raise ValueError("Payment has failed and cannot progress")

        stage_attr = f"stage_{stage}_status"
        current_status = getattr(payment, stage_attr)

        # Idempotency: a completed stage stays completed.
        if current_status == PaymentStageStatus.COMPLETED.value:
            return payment

        # A stage cannot complete until the previous stage is completed.
        if stage > 1:
            previous_status = getattr(
                payment,
                f"stage_{stage - 1}_status",
            )
            if previous_status != PaymentStageStatus.COMPLETED.value:
                raise ValueError(
                    f"Payment stage {stage} cannot be completed before "
                    f"stage {stage - 1}"
                )

        if stage == 3:
            return self._finalize_payment(
                db,
                order=order,
                payment=payment,
                provider_reference=provider_reference,
            )

        try:
            setattr(
                payment,
                stage_attr,
                PaymentStageStatus.COMPLETED.value,
            )

            if provider_reference:
                payment.provider_reference = provider_reference

            db.flush()
            db.commit()
            db.refresh(payment)

            return payment
        except Exception:
            db.rollback()
            raise

    def _finalize_payment(
        self,
        db: Session,
        *,
        order,
        payment: Payment,
        provider_reference: Optional[str] = None,
    ) -> Payment:
        """
        Atomically complete Stage 3, confirm the order, and grant access.

        Any exception rolls back all changes in this transaction.
        """
        if payment.stage_2_status != PaymentStageStatus.COMPLETED.value:
            raise ValueError(
                "Payment stage 3 cannot be completed before stage 2"
            )

        try:
            order_items = self.order_repo.get_items(
                db,
                order.id,
            )

            if not order_items:
                raise ValueError("Order has no items")

            # Validate every purchased product has a corresponding story.
            stories_by_product = {}

            for item in order_items:
                story = (
                    db.query(Story)
                    .filter(Story.product_id == item.product_id)
                    .first()
                )

                if story is None:
                    raise ValueError(
                        f"No story is mapped to product '{item.product_id}'"
                    )

                stories_by_product[item.product_id] = story

            payment.stage_3_status = PaymentStageStatus.COMPLETED.value
            payment.status = PaymentStatus.CONFIRMED.value

            if provider_reference:
                payment.provider_reference = provider_reference

            order.status = OrderStatus.CONFIRMED.value

            db.flush()

            # Grant all purchased stories inside the same transaction.
            for item in order_items:
                story = stories_by_product[item.product_id]

                self.library_repo.add_to_library_without_commit(
                    db,
                    user_id=order.user_id,
                    story_id=story.id,
                    access_type="purchased",
                    source_order_id=order.id,
                )

            db.flush()
            db.commit()
            db.refresh(payment)

            return payment

        except Exception:
            db.rollback()
            raise


payment_service = PaymentService()

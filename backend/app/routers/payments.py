from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import require_role
from app.schemas.payment import PaymentResponse, PaymentStageRequest
from app.services.payment_service import payment_service


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


customer_required = require_role(["Customer"])


@router.post(
    "/{order_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    order_id: str,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        return payment_service.create_payment(
            db=db,
            user_id=current_user.id,
            order_id=order_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get(
    "/{order_id}",
    response_model=PaymentResponse,
)
def get_payment(
    order_id: str,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        return payment_service.get_payment(
            db=db,
            user_id=current_user.id,
            order_id=order_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


def _complete_stage(
    *,
    stage: int,
    order_id: str,
    payload: PaymentStageRequest,
    current_user,
    db: Session,
):
    try:
        return payment_service.complete_stage(
            db=db,
            user_id=current_user.id,
            order_id=order_id,
            stage=stage,
            provider_reference=payload.provider_reference,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post(
    "/{order_id}/stage/1",
    response_model=PaymentResponse,
)
def complete_stage_1(
    order_id: str,
    payload: PaymentStageRequest | None = None,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    return _complete_stage(
        stage=1,
        order_id=order_id,
        payload=payload or PaymentStageRequest(),
        current_user=current_user,
        db=db,
    )


@router.post(
    "/{order_id}/stage/2",
    response_model=PaymentResponse,
)
def complete_stage_2(
    order_id: str,
    payload: PaymentStageRequest | None = None,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    return _complete_stage(
        stage=2,
        order_id=order_id,
        payload=payload or PaymentStageRequest(),
        current_user=current_user,
        db=db,
    )


@router.post(
    "/{order_id}/stage/3",
    response_model=PaymentResponse,
)
def complete_stage_3(
    order_id: str,
    payload: PaymentStageRequest | None = None,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    return _complete_stage(
        stage=3,
        order_id=order_id,
        payload=payload or PaymentStageRequest(),
        current_user=current_user,
        db=db,
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import require_role
from app.schemas.order import (
    OrderItemResponse,
    OrderListResponse,
    OrderResponse,
)
from app.services.order_service import order_service


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


customer_required = require_role(["Customer"])


def build_order_response(
    db: Session,
    order,
) -> OrderResponse:
    items = order_service.get_order_items(
        db,
        order.id,
    )

    item_responses = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product_name,
            unit_price=item.unit_price,
            currency=item.currency,
            quantity=item.quantity,
            line_total=item.line_total,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in items
    ]

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        currency=order.currency,
        subtotal=order.subtotal,
        total=order.total,
        items=item_responses,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        order = order_service.create_from_cart(
            db=db,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return build_order_response(
        db,
        order,
    )


@router.get(
    "",
    response_model=OrderListResponse,
)
def list_orders(
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    orders = order_service.list_orders(
        db=db,
        user_id=current_user.id,
    )

    return OrderListResponse(
        orders=[
            build_order_response(db, order)
            for order in orders
        ]
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: str,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        order = order_service.get_order(
            db=db,
            user_id=current_user.id,
            order_id=order_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return build_order_response(
        db,
        order,
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import require_role
from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)
from app.services.cart_service import cart_service


router = APIRouter(
    prefix="/cart",
    tags=["Cart"],
)


customer_required = require_role(["Customer"])


def build_cart_response(
    db: Session,
    user_id: str,
) -> CartResponse:
    cart = cart_service.get_or_create_cart(
        db,
        user_id,
    )

    items = cart_service.get_cart_items(
        db,
        cart,
    )

    item_responses = []

    for item, product in items:
        line_total = product.price * item.quantity

        item_responses.append(
            CartItemResponse(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=product.price,
                currency=product.currency,
                line_total=line_total,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )

    subtotal, total = cart_service.calculate_totals(items)

    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        status=cart.status,
        items=item_responses,
        subtotal=subtotal,
        total=total,
        created_at=cart.created_at,
        updated_at=cart.updated_at,
    )


@router.get(
    "",
    response_model=CartResponse,
)
def get_cart(
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    return build_cart_response(
        db,
        current_user.id,
    )


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_cart_item(
    payload: CartItemCreate,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        cart_service.add_item(
            db=db,
            user_id=current_user.id,
            product_id=payload.product_id,
            quantity=payload.quantity,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return build_cart_response(
        db,
        current_user.id,
    )


@router.patch(
    "/items/{item_id}",
    response_model=CartResponse,
)
def update_cart_item(
    item_id: str,
    payload: CartItemUpdate,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        cart_service.update_item(
            db=db,
            user_id=current_user.id,
            item_id=item_id,
            quantity=payload.quantity,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return build_cart_response(
        db,
        current_user.id,
    )


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_cart_item(
    item_id: str,
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    try:
        cart_service.remove_item(
            db=db,
            user_id=current_user.id,
            item_id=item_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clear_cart(
    current_user=Depends(customer_required),
    db: Session = Depends(get_db),
):
    cart_service.clear_cart(
        db=db,
        user_id=current_user.id,
    )

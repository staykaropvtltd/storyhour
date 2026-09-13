from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=List[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="List active products",
)
def list_products(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[ProductResponse]:
    """
    List active products for public product discovery.
    """
    return product_service.list_products(
        db,
        active_only=True,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{slug}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product by slug",
)
def get_product_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> ProductResponse:
    """
    Retrieve an active product by its unique URL slug.
    """
    product = product_service.get_product_by_slug(db, slug)

    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with slug '{slug}' not found",
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
    dependencies=[Depends(require_role(["Editor", "Administrator"]))],
)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
) -> ProductResponse:
    """
    Create a commerce product.
    Restricted to Editors and Administrators.
    """
    existing_product = product_service.get_product_by_slug(db, payload.slug)

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with slug '{payload.slug}' already exists",
        )

    return product_service.create_product(
        db,
        **payload.model_dump(),
    )


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product",
    dependencies=[Depends(require_role(["Editor", "Administrator"]))],
)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductResponse:
    """
    Update a commerce product.
    Restricted to Editors and Administrators.
    """
    product = product_service.get_product_by_id(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id '{product_id}' not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != product.slug:
        existing_product = product_service.get_product_by_slug(
            db,
            update_data["slug"],
        )

        if existing_product and existing_product.id != product.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with slug '{update_data['slug']}' already exists",
            )

    return product_service.update_product(
        db,
        product,
        **update_data,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete product",
    dependencies=[Depends(require_role(["Administrator"]))],
)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
) -> None:
    """
    Soft-delete a product.
    Restricted to Administrators.
    """
    product = product_service.get_product_by_id(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id '{product_id}' not found",
        )

    product_service.delete_product(db, product)

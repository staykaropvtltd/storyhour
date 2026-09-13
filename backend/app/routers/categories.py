from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])

category_repo = CategoryRepository()


@router.get(
    "",
    response_model=List[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List active content categories",
)
def list_categories(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[CategoryResponse]:
    """
    Retrieve active categories alphabetically.
    Excludes inactive categories from public taxonomy.
    """
    categories = category_repo.list(
        db,
        active_only=True,
        skip=skip,
        limit=limit,
    )
    return categories


@router.get(
    "/{slug}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get category details by slug",
)
def get_category_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> CategoryResponse:
    """
    Retrieve a category by unique URL slug.
    Returns 404 if the category does not exist.
    """
    category = category_repo.get_by_slug(db, slug=slug)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with slug '{slug}' not found",
        )
    return category

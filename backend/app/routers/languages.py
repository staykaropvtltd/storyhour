from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.language import LanguageRepository
from app.schemas.language import LanguageResponse

router = APIRouter(prefix="/languages", tags=["Languages"])

language_repo = LanguageRepository()


@router.get(
    "",
    response_model=List[LanguageResponse],
    status_code=status.HTTP_200_OK,
    summary="List active languages",
)
def list_languages(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[LanguageResponse]:
    """
    Retrieve active languages sorted alphabetically by name.
    Excludes inactive languages from public localization.
    """
    languages = language_repo.list(
        db,
        active_only=True,
        skip=skip,
        limit=limit,
    )
    return languages


@router.get(
    "/{code}",
    response_model=LanguageResponse,
    status_code=status.HTTP_200_OK,
    summary="Get language details by ISO code",
)
def get_language_by_code(
    code: str,
    db: Session = Depends(get_db),
) -> LanguageResponse:
    """
    Retrieve a language by its ISO code (e.g. en, hi, te).
    Returns 404 if the language code is not found.
    """
    language = language_repo.get_by_code(db, code=code)
    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Language with code '{code}' not found",
        )
    return language

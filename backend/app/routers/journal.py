from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.journal import JournalResponse, JournalSummaryResponse
from app.services.journal_service import journal_service

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.get(
    "",
    response_model=List[JournalSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List published journal articles with optional filtering",
)
def list_journal_articles(
    category: Optional[str] = Query(None, description="Filter by editorial category"),
    tag: Optional[str] = Query(None, description="Filter by article tag"),
    featured: Optional[bool] = Query(None, description="Filter by featured showcase status"),
    search: Optional[str] = Query(None, description="Search across title, excerpt, and author"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[JournalSummaryResponse]:
    """
    Retrieve list of published journal articles for editorial reading.
    Excludes drafts and review articles from public discovery.
    """
    return journal_service.list_published_articles(
        db,
        category=category,
        tag=tag,
        featured=featured,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{slug}",
    response_model=JournalResponse,
    status_code=status.HTTP_200_OK,
    summary="Get journal article details by slug",
)
def get_journal_article_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> JournalResponse:
    """
    Retrieve full article content and metadata by slug.
    Returns 404 if the article does not exist or is not published.
    """
    article = journal_service.get_article_by_slug(db, slug=slug, published_only=True)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with slug '{slug}' not found",
        )
    return article

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.chapter import ChapterRepository
from app.schemas.chapter import ChapterResponse
from app.schemas.story import StoryResponse, StorySummaryResponse
from app.services.story_service import StoryService

router = APIRouter(prefix="/stories", tags=["Stories"])

story_service = StoryService()
chapter_repo = ChapterRepository()


@router.get(
    "",
    response_model=List[StorySummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List published stories with optional filtering and search",
)
def list_stories(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    language: Optional[str] = Query(None, description="Filter by language code (e.g. en, hi, te)"),
    search: Optional[str] = Query(None, description="Search term across story title and hook"),
    featured: Optional[bool] = Query(None, description="Filter by featured showcase status"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[StorySummaryResponse]:
    """
    List published stories for public discovery.
    Excludes all draft, review, or archived content.
    """
    stories = story_service.list_published_stories(
        db,
        featured=featured,
        category_slug=category,
        language_code=language,
        search=search,
        skip=skip,
        limit=limit,
    )
    return stories


@router.get(
    "/{slug}",
    response_model=StoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get story details by unique URL slug",
)
def get_story_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> StoryResponse:
    """
    Retrieve full story details including metadata, categories, languages, and ordered chapters.
    Restricted to published stories only. Returns 404 if not found or not published.
    """
    story = story_service.get_story_by_slug(db, slug=slug, published_only=True)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with slug '{slug}' not found",
        )
    return story


@router.get(
    "/{slug}/chapters",
    response_model=List[ChapterResponse],
    status_code=status.HTTP_200_OK,
    summary="Get story chapters in ascending order",
)
def get_story_chapters(
    slug: str,
    db: Session = Depends(get_db),
) -> List[ChapterResponse]:
    """
    Fetch all chapters for a given published story.
    Guarantees strict database-driven chapter sequence ordering (1, 2, 3...).
    Returns 404 if the story is missing or not published.
    """
    story = story_service.get_story_by_slug(db, slug=slug, published_only=True)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with slug '{slug}' not found",
        )
    chapters = chapter_repo.get_by_story(db, story_id=story.id)
    return chapters

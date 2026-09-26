from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.audio_asset import AudioAccessType, AudioAsset
from app.models.category import Category
from app.models.chapter import Chapter
from app.models.event import Event, EventStatus
from app.models.journal import JournalArticle, JournalStatus
from app.models.language import Language
from app.models.story import Story, StoryStatus
from app.repositories.category import CategoryRepository
from app.repositories.chapter import ChapterRepository
from app.repositories.language import LanguageRepository
from app.schemas.analytics import AnalyticsEventResponse, AnalyticsSummaryResponse
from app.schemas.audio import AudioAssetCreate, AudioAssetResponse, AudioAssetUpdate
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.chapter import ChapterCreate, ChapterResponse, ChapterUpdate
from app.schemas.contact import ContactResponse, ContactStatusUpdate
from app.schemas.event import EventCreate, EventResponse, EventSummaryResponse, EventUpdate
from app.schemas.journal import (
    JournalArticleCreate,
    JournalArticleUpdate,
    JournalResponse,
    JournalSummaryResponse,
)
from app.schemas.language import LanguageCreate, LanguageResponse, LanguageUpdate
from app.schemas.story import StoryCreate, StoryResponse, StorySummaryResponse, StoryUpdate
from app.services.analytics_service import analytics_service
from app.services.audio_service import AudioService
from app.services.contact_service import contact_service
from app.services.event_service import event_service
from app.services.journal_service import journal_service
from app.services.story_service import StoryService

router = APIRouter(
    prefix="/admin",
    tags=["Admin & CMS"],
    dependencies=[Depends(require_role(["Administrator", "Editor"]))],
)

admin_only = [Depends(require_role(["Administrator"]))]

story_service = StoryService()
audio_service = AudioService()
chapter_repo = ChapterRepository()
category_repo = CategoryRepository()
language_repo = LanguageRepository()


# ============================================================================
# STORIES CMS
# ============================================================================

@router.get(
    "/stories",
    response_model=List[StorySummaryResponse],
    summary="Admin list stories across all statuses",
)
def admin_list_stories(
    status: Optional[StoryStatus] = Query(None, description="Filter by editorial status"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    language: Optional[str] = Query(None, description="Filter by language code"),
    search: Optional[str] = Query(None, description="Search across title and hook"),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[StorySummaryResponse]:
    return story_service.list_admin_stories(
        db,
        status=status,
        featured=featured,
        category_slug=category,
        language_code=language,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/stories",
    response_model=StoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create story",
)
def admin_create_story(
    payload: StoryCreate,
    db: Session = Depends(get_db),
) -> StoryResponse:
    existing = story_service.get_story_by_slug(db, slug=payload.slug, published_only=False)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Story with slug '{payload.slug}' already exists",
        )
    return story_service.create_story(db, payload)


@router.get(
    "/stories/{id}",
    response_model=StoryResponse,
    summary="Admin get story details including draft",
)
def admin_get_story(
    id: str,
    db: Session = Depends(get_db),
) -> StoryResponse:
    story = story_service.get_story_by_id(db, story_id=id)
    if not story:
        story = story_service.get_story_by_slug(db, slug=id, published_only=False)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id/slug '{id}' not found",
        )
    return story


@router.patch(
    "/stories/{id}",
    response_model=StoryResponse,
    summary="Admin update story",
)
def admin_update_story(
    id: str,
    payload: StoryUpdate,
    db: Session = Depends(get_db),
) -> StoryResponse:
    story = story_service.get_story_by_id(db, story_id=id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{id}' not found",
        )
    if payload.slug and payload.slug != story.slug:
        existing = story_service.get_story_by_slug(db, slug=payload.slug, published_only=False)
        if existing and existing.id != story.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Story with slug '{payload.slug}' already exists",
            )
    return story_service.update_story(db, story, payload)


@router.delete(
    "/stories/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete story",
    dependencies=admin_only,
)
def admin_delete_story(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    story = story_service.get_story_by_id(db, story_id=id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{id}' not found",
        )
    story_service.delete_story(db, story)


@router.post(
    "/stories/{id}/publish",
    response_model=StoryResponse,
    summary="Publish story to public catalog",
)
def admin_publish_story(
    id: str,
    db: Session = Depends(get_db),
) -> StoryResponse:
    story = story_service.get_story_by_id(db, story_id=id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{id}' not found",
        )
    return story_service.publish_story(db, story)


@router.post(
    "/stories/{id}/unpublish",
    response_model=StoryResponse,
    summary="Unpublish story back to DRAFT",
)
def admin_unpublish_story(
    id: str,
    db: Session = Depends(get_db),
) -> StoryResponse:
    story = story_service.get_story_by_id(db, story_id=id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{id}' not found",
        )
    return story_service.unpublish_story(db, story)


# ============================================================================
# CHAPTERS CMS
# ============================================================================

@router.get(
    "/stories/{story_id}/chapters",
    response_model=List[ChapterResponse],
    summary="Admin list chapters for a story",
)
def admin_list_chapters(
    story_id: str,
    db: Session = Depends(get_db),
) -> List[ChapterResponse]:
    story = story_service.get_story_by_id(db, story_id=story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{story_id}' not found",
        )
    return chapter_repo.get_by_story(db, story_id=story.id)


@router.post(
    "/stories/{story_id}/chapters",
    response_model=ChapterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create chapter for story",
)
def admin_create_chapter(
    story_id: str,
    payload: ChapterCreate,
    db: Session = Depends(get_db),
) -> ChapterResponse:
    story = story_service.get_story_by_id(db, story_id=story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with id '{story_id}' not found",
        )
    existing_chapter = chapter_repo.get_by_story_and_order(db, story_id=story.id, order=payload.order)
    if existing_chapter:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Chapter with order {payload.order} already exists for this story",
        )
    chapter_data = payload.model_dump()
    chapter_data["story_id"] = story.id
    chapter = Chapter(**chapter_data)
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.get(
    "/chapters/{id}",
    response_model=ChapterResponse,
    summary="Admin get chapter details",
)
def admin_get_chapter(
    id: str,
    db: Session = Depends(get_db),
) -> ChapterResponse:
    chapter = chapter_repo.get_by_id(db, id=id)
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter with id '{id}' not found",
        )
    return chapter


@router.patch(
    "/chapters/{id}",
    response_model=ChapterResponse,
    summary="Admin update chapter",
)
def admin_update_chapter(
    id: str,
    payload: ChapterUpdate,
    db: Session = Depends(get_db),
) -> ChapterResponse:
    chapter = chapter_repo.get_by_id(db, id=id)
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter with id '{id}' not found",
        )
    update_data = payload.model_dump(exclude_unset=True)
    if "order" in update_data and update_data["order"] != chapter.order:
        existing = chapter_repo.get_by_story_and_order(db, story_id=chapter.story_id, order=update_data["order"])
        if existing and existing.id != chapter.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Chapter with order {update_data['order']} already exists for this story",
            )
    for key, value in update_data.items():
        setattr(chapter, key, value)
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete(
    "/chapters/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete chapter",
    dependencies=admin_only,
)
def admin_delete_chapter(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    chapter = chapter_repo.get_by_id(db, id=id)
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter with id '{id}' not found",
        )
    db.delete(chapter)
    db.commit()


# ============================================================================
# CATEGORIES CMS
# ============================================================================

@router.get(
    "/categories",
    response_model=List[CategoryResponse],
    summary="Admin list categories (includes inactive)",
)
def admin_list_categories(
    db: Session = Depends(get_db),
) -> List[CategoryResponse]:
    return category_repo.list(db, active_only=False, skip=0, limit=200)


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create category",
)
def admin_create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
) -> CategoryResponse:
    existing = category_repo.get_by_slug(db, slug=payload.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with slug '{payload.slug}' already exists",
        )
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch(
    "/categories/{id}",
    response_model=CategoryResponse,
    summary="Admin update category",
)
def admin_update_category(
    id: str,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
) -> CategoryResponse:
    category = category_repo.get_by_id(db, id=id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{id}' not found",
        )
    update_data = payload.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != category.slug:
        existing = category_repo.get_by_slug(db, slug=update_data["slug"])
        if existing and existing.id != category.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category with slug '{update_data['slug']}' already exists",
            )
    for key, value in update_data.items():
        setattr(category, key, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/categories/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete category",
    dependencies=admin_only,
)
def admin_delete_category(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    category = category_repo.get_by_id(db, id=id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{id}' not found",
        )
    db.delete(category)
    db.commit()


# ============================================================================
# LANGUAGES CMS
# ============================================================================

@router.get(
    "/languages",
    response_model=List[LanguageResponse],
    summary="Admin list languages (includes inactive)",
)
def admin_list_languages(
    db: Session = Depends(get_db),
) -> List[LanguageResponse]:
    return language_repo.list(db, active_only=False, skip=0, limit=200)


@router.post(
    "/languages",
    response_model=LanguageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create language",
)
def admin_create_language(
    payload: LanguageCreate,
    db: Session = Depends(get_db),
) -> LanguageResponse:
    existing = language_repo.get_by_code(db, code=payload.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Language with code '{payload.code}' already exists",
        )
    language = Language(**payload.model_dump())
    db.add(language)
    db.commit()
    db.refresh(language)
    return language


@router.patch(
    "/languages/{id}",
    response_model=LanguageResponse,
    summary="Admin update language",
)
def admin_update_language(
    id: str,
    payload: LanguageUpdate,
    db: Session = Depends(get_db),
) -> LanguageResponse:
    language = language_repo.get_by_id(db, id=id)
    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Language with id '{id}' not found",
        )
    update_data = payload.model_dump(exclude_unset=True)
    if "code" in update_data and update_data["code"].lower() != language.code:
        existing = language_repo.get_by_code(db, code=update_data["code"])
        if existing and existing.id != language.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Language with code '{update_data['code']}' already exists",
            )
    for key, value in update_data.items():
        setattr(language, key, value)
    db.add(language)
    db.commit()
    db.refresh(language)
    return language


@router.delete(
    "/languages/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete language",
    dependencies=admin_only,
)
def admin_delete_language(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    language = language_repo.get_by_id(db, id=id)
    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Language with id '{id}' not found",
        )
    db.delete(language)
    db.commit()


# ============================================================================
# EVENTS CMS
# ============================================================================

@router.get(
    "/events",
    response_model=List[EventSummaryResponse],
    summary="Admin list events across all statuses",
)
def admin_list_events(
    status: Optional[EventStatus] = Query(None, description="Filter by event status"),
    event_type: Optional[str] = Query(None, description="Filter by event format"),
    is_online: Optional[bool] = Query(None, description="Filter virtual/in-person"),
    featured: Optional[bool] = Query(None, description="Filter featured showcase"),
    search: Optional[str] = Query(None, description="Search term across title and description"),
    include_deleted: bool = Query(False, description="Whether to include soft-deleted events"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[EventSummaryResponse]:
    return event_service.list_admin_events(
        db,
        status=status,
        event_type=event_type,
        is_online=is_online,
        featured=featured,
        search=search,
        include_deleted=include_deleted,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/events",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create event",
)
def admin_create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
) -> EventResponse:
    existing = event_service.get_event_by_slug(db, slug=payload.slug, published_only=False)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Event with slug '{payload.slug}' already exists",
        )
    return event_service.create_event(db, payload)


@router.get(
    "/events/{id}",
    response_model=EventResponse,
    summary="Admin get event details",
)
def admin_get_event(
    id: str,
    db: Session = Depends(get_db),
) -> EventResponse:
    event = event_service.get_event_by_id(db, event_id=id)
    if not event:
        event = event_service.get_event_by_slug(db, slug=id, published_only=False)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id/slug '{id}' not found",
        )
    return event


@router.patch(
    "/events/{id}",
    response_model=EventResponse,
    summary="Admin update event",
)
def admin_update_event(
    id: str,
    payload: EventUpdate,
    db: Session = Depends(get_db),
) -> EventResponse:
    event = event_service.get_event_by_id(db, event_id=id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{id}' not found",
        )
    if payload.slug and payload.slug != event.slug:
        existing = event_service.get_event_by_slug(db, slug=payload.slug, published_only=False)
        if existing and existing.id != event.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Event with slug '{payload.slug}' already exists",
            )
    return event_service.update_event(db, event, payload)


@router.delete(
    "/events/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin soft-delete event",
    dependencies=admin_only,
)
def admin_delete_event(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    event = event_service.get_event_by_id(db, event_id=id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{id}' not found",
        )
    event_service.delete_event(db, event)


@router.post(
    "/events/{id}/publish",
    response_model=EventResponse,
    summary="Publish event",
)
def admin_publish_event(
    id: str,
    db: Session = Depends(get_db),
) -> EventResponse:
    event = event_service.get_event_by_id(db, event_id=id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{id}' not found",
        )
    return event_service.publish_event(db, event)


@router.post(
    "/events/{id}/unpublish",
    response_model=EventResponse,
    summary="Unpublish event back to DRAFT",
)
def admin_unpublish_event(
    id: str,
    db: Session = Depends(get_db),
) -> EventResponse:
    event = event_service.get_event_by_id(db, event_id=id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id '{id}' not found",
        )
    return event_service.unpublish_event(db, event)


# ============================================================================
# JOURNAL CMS
# ============================================================================

@router.get(
    "/journal",
    response_model=List[JournalSummaryResponse],
    summary="Admin list journal articles across all statuses",
)
def admin_list_journal(
    status: Optional[JournalStatus] = Query(None, description="Filter by article status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    featured: Optional[bool] = Query(None, description="Filter featured status"),
    search: Optional[str] = Query(None, description="Search across title and excerpt"),
    include_deleted: bool = Query(False, description="Whether to include soft-deleted articles"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[JournalSummaryResponse]:
    return journal_service.list_admin_articles(
        db,
        status=status,
        category=category,
        tag=tag,
        featured=featured,
        search=search,
        include_deleted=include_deleted,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/journal",
    response_model=JournalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create journal article",
)
def admin_create_journal(
    payload: JournalArticleCreate,
    db: Session = Depends(get_db),
) -> JournalResponse:
    existing = journal_service.get_article_by_slug(db, slug=payload.slug, published_only=False)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Journal article with slug '{payload.slug}' already exists",
        )
    return journal_service.create_article(db, payload)


@router.get(
    "/journal/{id}",
    response_model=JournalResponse,
    summary="Admin get journal article details",
)
def admin_get_journal(
    id: str,
    db: Session = Depends(get_db),
) -> JournalResponse:
    article = journal_service.get_article_by_id(db, article_id=id)
    if not article:
        article = journal_service.get_article_by_slug(db, slug=id, published_only=False)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with id/slug '{id}' not found",
        )
    return article


@router.patch(
    "/journal/{id}",
    response_model=JournalResponse,
    summary="Admin update journal article",
)
def admin_update_journal(
    id: str,
    payload: JournalArticleUpdate,
    db: Session = Depends(get_db),
) -> JournalResponse:
    article = journal_service.get_article_by_id(db, article_id=id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with id '{id}' not found",
        )
    if payload.slug and payload.slug != article.slug:
        existing = journal_service.get_article_by_slug(db, slug=payload.slug, published_only=False)
        if existing and existing.id != article.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Journal article with slug '{payload.slug}' already exists",
            )
    return journal_service.update_article(db, article, payload)


@router.delete(
    "/journal/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin soft-delete journal article",
    dependencies=admin_only,
)
def admin_delete_journal(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    article = journal_service.get_article_by_id(db, article_id=id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with id '{id}' not found",
        )
    journal_service.delete_article(db, article)


@router.post(
    "/journal/{id}/publish",
    response_model=JournalResponse,
    summary="Publish journal article",
)
def admin_publish_journal(
    id: str,
    db: Session = Depends(get_db),
) -> JournalResponse:
    article = journal_service.get_article_by_id(db, article_id=id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with id '{id}' not found",
        )
    return journal_service.publish_article(db, article)


@router.post(
    "/journal/{id}/unpublish",
    response_model=JournalResponse,
    summary="Unpublish journal article back to DRAFT",
)
def admin_unpublish_journal(
    id: str,
    db: Session = Depends(get_db),
) -> JournalResponse:
    article = journal_service.get_article_by_id(db, article_id=id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal article with id '{id}' not found",
        )
    return journal_service.unpublish_article(db, article)


# ============================================================================
# CONTACT ENQUIRIES ADMIN
# ============================================================================

@router.get(
    "/contact",
    response_model=List[ContactResponse],
    summary="Admin list contact enquiries",
)
def admin_list_contact(
    status: Optional[str] = Query(None, description="Filter by status ('unread', 'read', 'in_progress', 'resolved')"),
    enquiry_type: Optional[str] = Query(None, description="Filter by enquiry type"),
    search: Optional[str] = Query(None, description="Search term across name, email, and message"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[ContactResponse]:
    submissions = contact_service.list_submissions(
        db,
        status=status,
        enquiry_type=enquiry_type,
        search=search,
        skip=skip,
        limit=limit,
    )
    return [ContactResponse.model_validate(s) for s in submissions]


@router.get(
    "/contact/{id}",
    response_model=ContactResponse,
    summary="Admin get contact enquiry details",
)
def admin_get_contact(
    id: str,
    db: Session = Depends(get_db),
) -> ContactResponse:
    submission = contact_service.get_submission_by_id(db, submission_id=id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact submission with id '{id}' not found",
        )
    return ContactResponse.model_validate(submission)


@router.patch(
    "/contact/{id}",
    response_model=ContactResponse,
    summary="Admin update contact enquiry status",
)
def admin_update_contact_status(
    id: str,
    payload: ContactStatusUpdate,
    db: Session = Depends(get_db),
) -> ContactResponse:
    submission = contact_service.get_submission_by_id(db, submission_id=id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact submission with id '{id}' not found",
        )
    updated = contact_service.update_status(db, submission, payload.status)
    return ContactResponse.model_validate(updated)


@router.delete(
    "/contact/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete contact enquiry",
    dependencies=admin_only,
)
def admin_delete_contact(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    submission = contact_service.get_submission_by_id(db, submission_id=id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact submission with id '{id}' not found",
        )
    contact_service.delete_submission(db, submission)


# ============================================================================
# MEDIA MANAGEMENT
# ============================================================================

@router.get(
    "/media",
    response_model=List[AudioAssetResponse],
    summary="Admin list audio media assets",
)
def admin_list_media(
    story_id: Optional[str] = Query(None, description="Filter by parent story UUID"),
    chapter_id: Optional[str] = Query(None, description="Filter by chapter UUID"),
    access_type: Optional[AudioAccessType] = Query(None, description="Filter by access tier"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[AudioAssetResponse]:
    return audio_service.list_assets(
        db,
        story_id=story_id,
        chapter_id=chapter_id,
        access_type=access_type,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/media",
    response_model=AudioAssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin register audio media asset",
)
def admin_create_media(
    payload: AudioAssetCreate,
    db: Session = Depends(get_db),
) -> AudioAssetResponse:
    story = story_service.get_story_by_id(db, story_id=payload.story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent story with id '{payload.story_id}' not found",
        )
    if payload.chapter_id:
        chapter = chapter_repo.get_by_id(db, id=payload.chapter_id)
        if not chapter or chapter.story_id != story.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter with id '{payload.chapter_id}' not found for this story",
            )
    return audio_service.create_asset(db, payload)


@router.get(
    "/media/{id}",
    response_model=AudioAssetResponse,
    summary="Admin get audio asset metadata",
)
def admin_get_media(
    id: str,
    db: Session = Depends(get_db),
) -> AudioAssetResponse:
    asset = audio_service.get_audio_metadata(db, audio_id=id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio asset with id '{id}' not found",
        )
    return asset


@router.patch(
    "/media/{id}",
    response_model=AudioAssetResponse,
    summary="Admin update audio asset metadata",
)
def admin_update_media(
    id: str,
    payload: AudioAssetUpdate,
    db: Session = Depends(get_db),
) -> AudioAssetResponse:
    asset = audio_service.get_audio_metadata(db, audio_id=id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio asset with id '{id}' not found",
        )
    if payload.chapter_id is not None:
        chapter = chapter_repo.get_by_id(db, id=payload.chapter_id)
        if not chapter or chapter.story_id != asset.story_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter with id '{payload.chapter_id}' not found for this story",
            )
    return audio_service.update_asset(db, asset, payload)


@router.delete(
    "/media/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Admin delete audio asset",
    dependencies=admin_only,
)
def admin_delete_media(
    id: str,
    db: Session = Depends(get_db),
) -> None:
    asset = audio_service.get_audio_metadata(db, audio_id=id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio asset with id '{id}' not found",
        )
    audio_service.delete_asset(db, asset)


# ============================================================================
# ANALYTICS ADMIN REPORTING
# ============================================================================

@router.get(
    "/analytics/events",
    response_model=List[AnalyticsEventResponse],
    summary="Admin query telemetry events",
)
def admin_query_analytics_events(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    user_id: Optional[str] = Query(None, description="Filter by user UUID"),
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    start_date: Optional[datetime] = Query(None, description="Query events on or after UTC timestamp"),
    end_date: Optional[datetime] = Query(None, description="Query events on or before UTC timestamp"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[AnalyticsEventResponse]:
    return analytics_service.list_events(
        db,
        event_type=event_type,
        user_id=user_id,
        session_id=session_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/analytics/summary",
    response_model=AnalyticsSummaryResponse,
    summary="Admin analytics summary metrics",
)
def admin_get_analytics_summary(
    db: Session = Depends(get_db),
) -> AnalyticsSummaryResponse:
    summary_data = analytics_service.get_summary(db)
    return AnalyticsSummaryResponse(**summary_data)

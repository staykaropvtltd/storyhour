from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.audio_asset import AudioAccessType
from app.models.story import StoryStatus
from app.repositories.audio import AudioRepository
from app.repositories.chapter import ChapterRepository
from app.schemas.audio import AudioPlaybackDescriptor
from app.schemas.user import AuthenticatedUser
from app.services.audio_service import AudioService
from app.services.library_service import LibraryService
from app.services.story_service import StoryService

router = APIRouter(prefix="/audio", tags=["Audio & Streaming"])

audio_service = AudioService()
audio_repo = AudioRepository()
story_service = StoryService()
chapter_repo = ChapterRepository()
library_service = LibraryService()


@router.get(
    "/{story_slug}/preview",
    response_model=AudioPlaybackDescriptor,
    status_code=status.HTTP_200_OK,
    summary="Get audio preview playback descriptor",
)
def get_audio_preview(
    story_slug: str,
    chapter_order: Optional[int] = Query(None, description="Optional chapter order index for chapter preview"),
    db: Session = Depends(get_db),
) -> AudioPlaybackDescriptor:
    """
    Retrieve safe audio preview playback descriptor for a published story or chapter.
    Does NOT leak object store bucket credentials, raw storage paths, or private signing keys.
    Returns 404 if the story is missing, unpublished, or has no public preview asset.
    """
    story = story_service.get_story_by_slug(db, slug=story_slug, published_only=True)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with slug '{story_slug}' not found",
        )

    target_asset = None

    if chapter_order is not None:
        chapter = chapter_repo.get_by_story_and_order(db, story_id=story.id, order=chapter_order)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter {chapter_order} not found in story '{story_slug}'",
            )
        assets = audio_repo.get_by_chapter(db, chapter_id=chapter.id)
        for a in assets:
            if audio_service.is_preview_allowed(a):
                target_asset = a
                break
    else:
        # Check story-level preview asset
        target_asset = audio_repo.get_story_preview_asset(db, story_id=story.id)
        if not target_asset:
            # Fallback to first chapter with preview_available
            for ch in story.chapters:
                if ch.preview_available:
                    ch_assets = audio_repo.get_by_chapter(db, chapter_id=ch.id)
                    if ch_assets:
                        target_asset = ch_assets[0]
                        break

    if not target_asset or not audio_service.is_preview_allowed(target_asset):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No public audio preview available for story '{story_slug}'",
        )

    descriptor = audio_service.prepare_playback_descriptor(target_asset, is_entitled=False)
    return descriptor


@router.get(
    "/{story_slug}/stream",
    response_model=AudioPlaybackDescriptor,
    status_code=status.HTTP_200_OK,
    summary="Get protected audio stream playback descriptor",
)
def get_protected_audio_stream(
    story_slug: str,
    chapter_order: Optional[int] = Query(None, description="Optional chapter order index to stream"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AudioPlaybackDescriptor:
    """
    Retrieve safe stream playback descriptor for protected story audio.
    Requires valid authentication and active story entitlement/library access.
    Returns 401 if unauthenticated, 403 if unentitled, and 404 if story is missing or unpublished.
    """
    # 1. Validate published story
    story = story_service.get_story_by_slug(db, slug=story_slug, published_only=True)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story with slug '{story_slug}' not found",
        )

    # 2. Enforce entitlement check
    is_entitled = library_service.check_user_entitlement(db, user_id=current_user.id, story=story)
    if not is_entitled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not entitled to access this protected audio content",
        )

    # 3. Locate target audio asset
    target_asset = None
    if chapter_order is not None:
        chapter = chapter_repo.get_by_story_and_order(db, story_id=story.id, order=chapter_order)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter {chapter_order} not found in story '{story_slug}'",
            )
        assets = audio_repo.get_by_chapter(db, chapter_id=chapter.id)
        if assets:
            target_asset = assets[0]
    else:
        # Return first available audio asset for the story
        assets = audio_repo.get_by_story(db, story_id=story.id)
        if assets:
            target_asset = assets[0]

    if not target_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio asset not found for story '{story_slug}'",
        )

    descriptor = audio_service.prepare_playback_descriptor(target_asset, is_entitled=True)
    return descriptor

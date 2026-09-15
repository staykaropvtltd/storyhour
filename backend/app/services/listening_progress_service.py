from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.story import Story, StoryStatus
from app.repositories.chapter import ChapterRepository
from app.repositories.listening_progress import ListeningProgressRepository
from app.repositories.story import StoryRepository
from app.schemas.listening_progress import (
    ListeningProgressResponse,
    ListeningProgressUpdate,
    ResumePointResponse,
)


class ListeningProgressService:
    """
    Business service orchestrating user audio playback progress,
    automatic completion threshold detection, and resume points.
    """

    def __init__(
        self,
        progress_repo: Optional[ListeningProgressRepository] = None,
        story_repo: Optional[StoryRepository] = None,
        chapter_repo: Optional[ChapterRepository] = None,
    ):
        self.progress_repo = progress_repo or ListeningProgressRepository()
        self.story_repo = story_repo or StoryRepository()
        self.chapter_repo = chapter_repo or ChapterRepository()

    def record_progress(
        self,
        db: Session,
        *,
        user_id: str,
        payload: ListeningProgressUpdate,
    ) -> ListeningProgressResponse:
        """
        Record or update playback timestamp for a user.
        Validates story publication, chapter bounds, and computes completion state.
        """
        if payload.position_seconds < 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Playback position cannot be negative.",
            )

        # 1. Validate parent story
        story = self.story_repo.get_by_id(db, payload.story_id)
        if not story or story.status != StoryStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Story with ID '{payload.story_id}' not found or not published.",
            )

        # 2. Validate optional chapter
        chapter = None
        if payload.chapter_id:
            chapter = self.chapter_repo.get_by_id(db, payload.chapter_id)
            if not chapter or chapter.story_id != story.id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Chapter with ID '{payload.chapter_id}' does not belong to story '{story.id}'.",
                )

        # 3. Determine completion logic
        # If user explicitly declared completion or position reached >= 90% of duration
        is_completed = bool(payload.is_completed)
        if not is_completed:
            target_duration = chapter.duration if chapter and chapter.duration > 0 else story.duration
            if target_duration > 0 and payload.position_seconds >= int(target_duration * 0.9):
                is_completed = True

        # 4. Upsert progress entry
        progress = self.progress_repo.upsert_progress(
            db,
            user_id=user_id,
            story_id=story.id,
            chapter_id=chapter.id if chapter else None,
            position_seconds=payload.position_seconds,
            is_completed=is_completed,
        )
        return ListeningProgressResponse.model_validate(progress)

    def get_story_progress(
        self,
        db: Session,
        *,
        user_id: str,
        story_id: str,
    ) -> List[ListeningProgressResponse]:
        """Fetch all listening progress entries for a specific story owned by the user."""
        story = self.story_repo.get_by_id(db, story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Story with ID '{story_id}' not found.",
            )

        records = self.progress_repo.get_story_progress(db, user_id=user_id, story_id=story_id)
        return [ListeningProgressResponse.model_validate(r) for r in records]

    def get_user_resume_points(
        self,
        db: Session,
        *,
        user_id: str,
        limit: int = 20,
    ) -> List[ResumePointResponse]:
        """Fetch active in-progress stories for quick resume."""
        records = self.progress_repo.get_user_resume_points(db, user_id=user_id, limit=limit)
        results = []
        for r in records:
            results.append(
                ResumePointResponse(
                    progress_id=r.id,
                    story_id=r.story_id,
                    story_title=r.story.title if r.story else "",
                    story_slug=r.story.slug if r.story else "",
                    chapter_id=r.chapter_id,
                    chapter_title=r.chapter.title if r.chapter else None,
                    position_seconds=r.position_seconds,
                    is_completed=r.is_completed,
                    updated_at=r.updated_at,
                )
            )
        return results

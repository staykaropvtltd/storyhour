from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.listening_progress import ListeningProgress


class ListeningProgressRepository(BaseRepository[ListeningProgress]):
    """Repository managing persistence for user audio listening progress."""

    def __init__(self):
        super().__init__(ListeningProgress)

    def get_by_user_story_chapter(
        self,
        db: Session,
        user_id: str,
        story_id: str,
        chapter_id: Optional[str] = None,
    ) -> Optional[ListeningProgress]:
        """Fetch a specific progress entry for a user, story, and optional chapter."""
        query = db.query(self.model).filter(
            self.model.user_id == user_id,
            self.model.story_id == story_id,
        )
        if chapter_id is not None:
            query = query.filter(self.model.chapter_id == chapter_id)
        else:
            query = query.filter(self.model.chapter_id.is_(None))
        return query.first()

    def upsert_progress(
        self,
        db: Session,
        *,
        user_id: str,
        story_id: str,
        chapter_id: Optional[str] = None,
        position_seconds: int,
        is_completed: bool = False,
    ) -> ListeningProgress:
        """Create or update playback progress for the user."""
        record = self.get_by_user_story_chapter(
            db,
            user_id=user_id,
            story_id=story_id,
            chapter_id=chapter_id,
        )

        if record:
            record.position_seconds = position_seconds
            record.is_completed = is_completed
        else:
            record = ListeningProgress(
                user_id=user_id,
                story_id=story_id,
                chapter_id=chapter_id,
                position_seconds=position_seconds,
                is_completed=is_completed,
            )
            db.add(record)

        db.commit()
        db.refresh(record)
        return record

    def get_story_progress(
        self,
        db: Session,
        user_id: str,
        story_id: str,
    ) -> List[ListeningProgress]:
        """Retrieve all progress records for a given user and story."""
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.story_id == story_id,
            )
            .order_by(self.model.updated_at.desc())
            .all()
        )

    def get_user_resume_points(
        self,
        db: Session,
        user_id: str,
        limit: int = 20,
    ) -> List[ListeningProgress]:
        """
        Fetch the user's most recently updated active playback positions
        for resuming in-progress stories.
        """
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.is_completed.is_(False),
                self.model.position_seconds > 0,
            )
            .order_by(self.model.updated_at.desc())
            .limit(limit)
            .all()
        )

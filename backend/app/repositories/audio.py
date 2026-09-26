from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.audio_asset import AudioAccessType, AudioAsset


class AudioRepository(BaseRepository[AudioAsset]):
    """Repository handling database access for AudioAsset entities."""

    def __init__(self):
        super().__init__(AudioAsset)

    def get_by_id(self, db: Session, id: str) -> Optional[AudioAsset]:
        """Retrieve audio asset metadata by primary key UUID."""
        return self.get(db, id)

    def get_by_story(self, db: Session, story_id: str) -> List[AudioAsset]:
        """Retrieve all audio assets linked to a story."""
        return (
            db.query(self.model)
            .filter(self.model.story_id == story_id)
            .all()
        )

    def get_by_chapter(self, db: Session, chapter_id: str) -> List[AudioAsset]:
        """Retrieve all audio assets associated with a specific chapter."""
        return (
            db.query(self.model)
            .filter(self.model.chapter_id == chapter_id)
            .all()
        )

    def get_story_preview_asset(self, db: Session, story_id: str) -> Optional[AudioAsset]:
        """Retrieve the primary free preview asset for a story if one exists."""
        return (
            db.query(self.model)
            .filter(
                self.model.story_id == story_id,
                self.model.access_type == AudioAccessType.PUBLIC_PREVIEW,
            )
            .first()
        )

    def list_assets(
        self,
        db: Session,
        *,
        story_id: Optional[str] = None,
        chapter_id: Optional[str] = None,
        access_type: Optional[AudioAccessType] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[AudioAsset]:
        """List audio assets with optional story, chapter, or access tier filters."""
        query = db.query(self.model)
        if story_id:
            query = query.filter(self.model.story_id == story_id)
        if chapter_id:
            query = query.filter(self.model.chapter_id == chapter_id)
        if access_type:
            query = query.filter(self.model.access_type == access_type)
        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

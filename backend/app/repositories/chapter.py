from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.chapter import Chapter


class ChapterRepository(BaseRepository[Chapter]):
    """Repository handling database access for Chapter entities."""

    def __init__(self):
        super().__init__(Chapter)

    def get_by_id(self, db: Session, id: str) -> Optional[Chapter]:
        """Retrieve chapter by primary key UUID."""
        return self.get(db, id)

    def get_by_story(self, db: Session, story_id: str) -> List[Chapter]:
        """
        Fetch all chapters for a given story, strictly ordered by the database 'order' column.
        Guarantees correct playback sequence regardless of database insertion order.
        """
        return (
            db.query(self.model)
            .filter(self.model.story_id == story_id)
            .order_by(self.model.order.asc())
            .all()
        )

    def get_by_story_and_order(
        self,
        db: Session,
        story_id: str,
        order: int,
    ) -> Optional[Chapter]:
        """Retrieve a specific chapter by story ID and chapter sequence order index."""
        return (
            db.query(self.model)
            .filter(
                self.model.story_id == story_id,
                self.model.order == order,
            )
            .first()
        )

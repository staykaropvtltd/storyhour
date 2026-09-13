from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.language import Language


class LanguageRepository(BaseRepository[Language]):
    """Repository handling database access for Language entities."""

    def __init__(self):
        super().__init__(Language)

    def get_by_id(self, db: Session, id: str) -> Optional[Language]:
        """Retrieve language by primary key UUID."""
        return self.get(db, id)

    def get_by_code(self, db: Session, code: str) -> Optional[Language]:
        """Retrieve language by ISO language code (e.g. en, hi, te)."""
        return db.query(self.model).filter(self.model.code == code.lower()).first()

    def list(
        self,
        db: Session,
        *,
        active_only: bool = True,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Language]:
        """List languages with optional active status filter."""
        query = db.query(self.model)
        if active_only:
            query = query.filter(self.model.is_active.is_(True))
        return query.order_by(self.model.name.asc()).offset(skip).limit(limit).all()

    # Explicit alias matching specification
    list_languages = list

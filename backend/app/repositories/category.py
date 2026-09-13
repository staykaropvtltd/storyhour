from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.category import Category


class CategoryRepository(BaseRepository[Category]):
    """Repository handling database access for Category entities."""

    def __init__(self):
        super().__init__(Category)

    def get_by_id(self, db: Session, id: str) -> Optional[Category]:
        """Retrieve category by primary key UUID."""
        return self.get(db, id)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Category]:
        """Retrieve category by URL slug."""
        return db.query(self.model).filter(self.model.slug == slug).first()

    def list(
        self,
        db: Session,
        *,
        active_only: bool = True,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Category]:
        """List categories with optional active status filter."""
        query = db.query(self.model)
        if active_only:
            query = query.filter(self.model.is_active.is_(True))
        return query.order_by(self.model.name.asc()).offset(skip).limit(limit).all()

    # Explicit alias matching specification
    list_categories = list

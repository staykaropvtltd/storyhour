from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.journal import JournalArticle, JournalStatus


class JournalRepository(BaseRepository[JournalArticle]):
    """Repository handling database access for JournalArticle entities."""

    def __init__(self):
        super().__init__(JournalArticle)

    def get_by_id(self, db: Session, id: str) -> Optional[JournalArticle]:
        """Retrieve article by primary key UUID."""
        return self.get(db, id)

    def get_by_slug(self, db: Session, slug: str) -> Optional[JournalArticle]:
        """Retrieve article by unique URL slug."""
        return db.query(self.model).filter(self.model.slug == slug).first()

    def list(
        self,
        db: Session,
        *,
        status: Optional[JournalStatus] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[JournalArticle]:
        """List articles with optional category, tag, featured, and text search filters."""
        query = db.query(self.model)

        if status is not None:
            query = query.filter(self.model.status == status)
        if category:
            query = query.filter(self.model.category == category)
        if featured is not None:
            query = query.filter(self.model.featured == featured)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    self.model.title.ilike(search_pattern),
                    self.model.short_description.ilike(search_pattern),
                    self.model.author_name.ilike(search_pattern),
                )
            )

        articles = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

        # In-memory tag filter if provided (safe for JSON array representation)
        if tag:
            tag_lower = tag.lower()
            articles = [
                a for a in articles
                if any(t.lower() == tag_lower for t in (a.tags or []))
            ]

        return articles

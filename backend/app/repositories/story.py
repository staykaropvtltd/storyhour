from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.category import Category
from app.models.language import Language
from app.models.story import Story, StoryStatus


class StoryRepository(BaseRepository[Story]):
    """Repository handling database access for Story entities."""

    def __init__(self):
        super().__init__(Story)

    def get_by_id(self, db: Session, id: str) -> Optional[Story]:
        """Retrieve story by primary key UUID."""
        return self.get(db, id)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Story]:
        """Retrieve story by unique URL slug."""
        return db.query(self.model).filter(self.model.slug == slug).first()

    def list(
        self,
        db: Session,
        *,
        status: Optional[StoryStatus] = None,
        featured: Optional[bool] = None,
        category_slug: Optional[str] = None,
        language_code: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Story]:
        """List stories with optional status, featured, category, language, and search filters."""
        query = db.query(self.model)

        if status is not None:
            query = query.filter(self.model.status == status)
        if featured is not None:
            query = query.filter(self.model.featured == featured)
        if category_slug:
            query = query.filter(self.model.categories.any(Category.slug == category_slug))
        if language_code:
            query = query.filter(self.model.languages.any(Language.code == language_code.lower()))
        if search:
            search_pattern = f"%{search}%"
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    self.model.title.ilike(search_pattern),
                    self.model.short_description.ilike(search_pattern),
                )
            )

        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    # Explicit alias matching specification
    list_stories = list

    def attach_category(self, db: Session, story: Story, category: Category) -> None:
        """Associate a Category to a Story if not already linked."""
        if category not in story.categories:
            story.categories.append(category)
            db.commit()
            db.refresh(story)

    def attach_language(self, db: Session, story: Story, language: Language) -> None:
        """Associate a Language to a Story if not already linked."""
        if language not in story.languages:
            story.languages.append(language)
            db.commit()
            db.refresh(story)

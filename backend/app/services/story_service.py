from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.story import Story, StoryStatus
from app.repositories.story import StoryRepository


class StoryService:
    """
    Business service layer orchestrating Story domain operations.
    Enforces publication lifecycle validation and query delegation.
    """

    def __init__(self, story_repo: Optional[StoryRepository] = None):
        self.story_repo = story_repo or StoryRepository()

    def get_story_by_id(self, db: Session, story_id: str) -> Optional[Story]:
        """Fetch story by unique identifier."""
        return self.story_repo.get_by_id(db, story_id)

    def get_story_by_slug(
        self,
        db: Session,
        slug: str,
        published_only: bool = False,
    ) -> Optional[Story]:
        """
        Fetch story by slug. If published_only is True, verifies that the story is PUBLISHED.
        """
        story = self.story_repo.get_by_slug(db, slug)
        if not story:
            return None
        if published_only and story.status != StoryStatus.PUBLISHED:
            return None
        return story

    def list_published_stories(
        self,
        db: Session,
        *,
        featured: Optional[bool] = None,
        category_slug: Optional[str] = None,
        language_code: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Story]:
        """List publicly available published stories for frontend discovery."""
        return self.story_repo.list(
            db,
            status=StoryStatus.PUBLISHED,
            featured=featured,
            category_slug=category_slug,
            language_code=language_code,
            search=search,
            skip=skip,
            limit=limit,
        )

    def list_admin_stories(
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
        """List stories across all lifecycle statuses for editorial/admin management."""
        return self.story_repo.list(
            db,
            status=status,
            featured=featured,
            category_slug=category_slug,
            language_code=language_code,
            search=search,
            skip=skip,
            limit=limit,
        )

    def create_story(self, db: Session, payload: "StoryCreate") -> Story:
        """Create a new story with taxonomy links and commit."""
        from app.models.category import Category
        from app.models.language import Language

        story_data = payload.model_dump(exclude={"category_ids", "language_ids"})
        story = Story(**story_data)

        if payload.category_ids:
            categories = db.query(Category).filter(Category.id.in_(payload.category_ids)).all()
            story.categories = categories

        if payload.language_ids:
            languages = db.query(Language).filter(Language.id.in_(payload.language_ids)).all()
            story.languages = languages

        db.add(story)
        db.commit()
        db.refresh(story)
        return story

    def update_story(self, db: Session, story: Story, payload: "StoryUpdate") -> Story:
        """Update existing story metadata and taxonomy links."""
        from app.models.category import Category
        from app.models.language import Language

        update_data = payload.model_dump(exclude_unset=True)

        if "category_ids" in update_data:
            cat_ids = update_data.pop("category_ids")
            if cat_ids is not None:
                story.categories = db.query(Category).filter(Category.id.in_(cat_ids)).all()

        if "language_ids" in update_data:
            lang_ids = update_data.pop("language_ids")
            if lang_ids is not None:
                story.languages = db.query(Language).filter(Language.id.in_(lang_ids)).all()

        for key, value in update_data.items():
            setattr(story, key, value)

        db.add(story)
        db.commit()
        db.refresh(story)
        return story

    def delete_story(self, db: Session, story: Story) -> None:
        """Permanently delete a story and cascade associated entities."""
        db.delete(story)
        db.commit()

    def publish_story(self, db: Session, story: Story) -> Story:
        """Transition story publishing lifecycle state to PUBLISHED."""
        story.status = StoryStatus.PUBLISHED
        db.add(story)
        db.commit()
        db.refresh(story)
        return story

    def unpublish_story(self, db: Session, story: Story) -> Story:
        """Transition story publishing lifecycle state back to DRAFT."""
        story.status = StoryStatus.DRAFT
        db.add(story)
        db.commit()
        db.refresh(story)
        return story

    def validate_content_state(self, story: Story) -> bool:
        """Check whether story content is ready for public streaming/consumption."""
        return story.status == StoryStatus.PUBLISHED

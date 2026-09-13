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

    def validate_content_state(self, story: Story) -> bool:
        """Check whether story content is ready for public streaming/consumption."""
        return story.status == StoryStatus.PUBLISHED

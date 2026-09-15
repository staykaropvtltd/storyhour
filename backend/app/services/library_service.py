from typing import Optional
from sqlalchemy.orm import Session

from app.models.library import LibraryItem
from app.models.story import Story
from app.repositories.library import LibraryRepository
from app.schemas.library import LibraryItemResponse, UserLibraryResponse
from app.schemas.story import StorySummaryResponse


class LibraryService:
    """
    Business service orchestrating user library access, story entitlement
    resolution, and commerce order synchronization.
    """

    def __init__(self, library_repo: Optional[LibraryRepository] = None):
        self.library_repo = library_repo or LibraryRepository()

    def get_user_library(
        self,
        db: Session,
        *,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
    ) -> UserLibraryResponse:
        """Fetch all active story entitlements belonging to the user."""
        items = self.library_repo.get_user_library(db, user_id=user_id, skip=skip, limit=limit)
        total = self.library_repo.count_user_library(db, user_id=user_id)

        responses = []
        for item in items:
            story_dto = None
            if item.story:
                story_dto = StorySummaryResponse.model_validate(item.story)
            responses.append(
                LibraryItemResponse(
                    id=item.id,
                    user_id=item.user_id,
                    story_id=item.story_id,
                    access_type=item.access_type,
                    is_active=item.is_active,
                    created_at=item.created_at,
                    story=story_dto,
                )
            )

        return UserLibraryResponse(
            user_id=user_id,
            items=responses,
            total_count=total,
        )

    def check_user_entitlement(
        self,
        db: Session,
        *,
        user_id: str,
        story: Story,
    ) -> bool:
        """
        Verify whether the user has active entitlement to consume the story's protected content.
        1. Checks existing user LibraryItem records.
        2. Checks confirmed commerce Orders for the story's linked product_id.
        """
        # Check 1: Direct library record
        existing = self.library_repo.get_library_item(db, user_id=user_id, story_id=story.id)
        if existing and existing.is_active:
            return True

        # Check 2: Confirmed commerce order matching story's linked product
        if story.product_id:
            order_id = self.library_repo.check_confirmed_order_for_product(
                db, user_id=user_id, product_id=story.product_id
            )
            if order_id:
                # Synchronize into user's library for instant future resolution
                self.library_repo.add_to_library(
                    db,
                    user_id=user_id,
                    story_id=story.id,
                    access_type="purchased",
                    source_order_id=order_id,
                )
                return True

        return False

    def grant_story_access(
        self,
        db: Session,
        *,
        user_id: str,
        story_id: str,
        access_type: str = "purchased",
        source_order_id: Optional[str] = None,
    ) -> LibraryItem:
        """Grant or reactivate library access for a user."""
        return self.library_repo.add_to_library(
            db,
            user_id=user_id,
            story_id=story_id,
            access_type=access_type,
            source_order_id=source_order_id,
        )

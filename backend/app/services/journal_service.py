from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.journal import JournalArticle, JournalStatus
from app.repositories.journal import JournalRepository


class JournalService:
    """
    Business service layer orchestrating Journal article operations.
    Enforces publication lifecycle validation and query delegation.
    """

    def __init__(self, journal_repo: Optional[JournalRepository] = None):
        self.journal_repo = journal_repo or JournalRepository()

    def get_article_by_id(self, db: Session, article_id: str) -> Optional[JournalArticle]:
        """Fetch article by unique UUID."""
        return self.journal_repo.get_by_id(db, article_id)

    def get_article_by_slug(
        self,
        db: Session,
        slug: str,
        published_only: bool = True,
    ) -> Optional[JournalArticle]:
        """
        Fetch article by slug.
        If published_only is True, verifies that the article status is PUBLISHED.
        """
        article = self.journal_repo.get_by_slug(db, slug)
        if not article:
            return None
        if published_only and article.status != JournalStatus.PUBLISHED:
            return None
        return article

    def list_published_articles(
        self,
        db: Session,
        *,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[JournalArticle]:
        """List published articles for public discovery."""
        return self.journal_repo.list(
            db,
            status=JournalStatus.PUBLISHED,
            category=category,
            tag=tag,
            featured=featured,
            search=search,
            skip=skip,
            limit=limit,
        )


journal_service = JournalService()

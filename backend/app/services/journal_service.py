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
        if published_only and (article.status != JournalStatus.PUBLISHED or article.is_deleted):
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

    def list_admin_articles(
        self,
        db: Session,
        *,
        status: Optional[JournalStatus] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        include_deleted: bool = False,
        skip: int = 0,
        limit: int = 20,
    ) -> List[JournalArticle]:
        """List articles across all statuses for administrative management."""
        return self.journal_repo.list(
            db,
            status=status,
            category=category,
            tag=tag,
            featured=featured,
            search=search,
            include_deleted=include_deleted,
            skip=skip,
            limit=limit,
        )

    def create_article(self, db: Session, payload: "JournalArticleCreate") -> JournalArticle:
        """Create a new journal article and persist."""
        article_data = payload.model_dump()
        article = JournalArticle(**article_data)
        db.add(article)
        db.commit()
        db.refresh(article)
        return article

    def update_article(self, db: Session, article: JournalArticle, payload: "JournalArticleUpdate") -> JournalArticle:
        """Update existing journal article fields and persist."""
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(article, key, value)
        db.add(article)
        db.commit()
        db.refresh(article)
        return article

    def delete_article(self, db: Session, article: JournalArticle) -> None:
        """Soft-delete a journal article."""
        article.soft_delete()
        db.add(article)
        db.commit()

    def publish_article(self, db: Session, article: JournalArticle) -> JournalArticle:
        """Transition journal article to PUBLISHED and set publication date if missing."""
        from datetime import datetime, timezone
        article.status = JournalStatus.PUBLISHED
        if not article.publication_date:
            article.publication_date = datetime.now(timezone.utc)
        db.add(article)
        db.commit()
        db.refresh(article)
        return article

    def unpublish_article(self, db: Session, article: JournalArticle) -> JournalArticle:
        """Transition journal article back to DRAFT."""
        article.status = JournalStatus.DRAFT
        db.add(article)
        db.commit()
        db.refresh(article)
        return article


journal_service = JournalService()

from typing import Optional
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.contact import ContactSubmission
from app.schemas.contact import ContactCreate


class ContactRepository(BaseRepository[ContactSubmission]):
    """Repository handling database access for ContactSubmission entities."""

    def __init__(self):
        super().__init__(ContactSubmission)

    def create_submission(
        self,
        db: Session,
        payload: ContactCreate,
    ) -> ContactSubmission:
        """Create and flush a new contact submission record."""
        submission = ContactSubmission(
            name=payload.name,
            email=str(payload.email),
            phone=payload.phone,
            enquiry_type=payload.enquiry_type,
            message=payload.message,
            status="unread",
        )
        db.add(submission)
        db.flush()
        db.refresh(submission)
        return submission

    def get_by_id(self, db: Session, id: str) -> Optional[ContactSubmission]:
        """Retrieve submission by primary key UUID."""
        return self.get(db, id)

    def list_submissions(
        self,
        db: Session,
        *,
        status: Optional[str] = None,
        enquiry_type: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[ContactSubmission]:
        """List contact submissions with optional filters."""
        query = db.query(self.model)

        if status:
            query = query.filter(self.model.status == status)
        if enquiry_type:
            query = query.filter(self.model.enquiry_type == enquiry_type)
        if search:
            search_pattern = f"%{search}%"
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    self.model.name.ilike(search_pattern),
                    self.model.email.ilike(search_pattern),
                    self.model.message.ilike(search_pattern),
                )
            )

        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    def update_status(
        self,
        db: Session,
        submission: ContactSubmission,
        status: str,
    ) -> ContactSubmission:
        """Update enquiry status and flush."""
        submission.status = status
        db.add(submission)
        db.flush()
        db.refresh(submission)
        return submission

    def delete_submission(
        self,
        db: Session,
        submission: ContactSubmission,
    ) -> None:
        """Delete a contact submission record."""
        db.delete(submission)
        db.flush()

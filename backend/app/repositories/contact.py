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

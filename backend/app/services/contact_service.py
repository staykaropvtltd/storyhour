from typing import Optional
from sqlalchemy.orm import Session

from app.models.contact import ContactSubmission
from app.repositories.contact import ContactRepository
from app.schemas.contact import ContactCreate


class ContactService:
    """
    Business service layer orchestrating contact submissions and message logging.
    """

    def __init__(self, contact_repo: Optional[ContactRepository] = None):
        self.contact_repo = contact_repo or ContactRepository()

    def submit_enquiry(
        self,
        db: Session,
        payload: ContactCreate,
    ) -> ContactSubmission:
        """
        Validate, persist, and commit a contact enquiry submission.
        """
        try:
            submission = self.contact_repo.create_submission(db, payload)
            db.commit()
            db.refresh(submission)
            return submission
        except Exception:
            db.rollback()
            raise


contact_service = ContactService()

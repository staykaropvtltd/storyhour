from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.contact_service import contact_service

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact or booking enquiry",
)
def submit_contact_enquiry(
    payload: ContactCreate,
    db: Session = Depends(get_db),
) -> ContactResponse:
    """
    Receive and store a visitor enquiry message.
    Validates name, email, enquiry type, and minimum message length.
    """
    submission = contact_service.submit_enquiry(db, payload)
    return ContactResponse.model_validate(submission)

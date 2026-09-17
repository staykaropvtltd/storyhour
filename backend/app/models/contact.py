from sqlalchemy import Column, String, Text

from app.database.base import BaseSaaSModel


class ContactSubmission(BaseSaaSModel):
    """
    StoryHour Contact Submission model.
    Stores visitor enquiries, school residency requests, performance booking requests,
    and collaboration messages.
    """
    __tablename__ = "contact_submissions"

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    enquiry_type = Column(
        String(100),
        nullable=False,
        default="General Enquiry",
        index=True,
    )
    message = Column(Text, nullable=False)
    status = Column(
        String(32),
        nullable=False,
        default="unread",
        index=True,
    )

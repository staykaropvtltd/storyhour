from fastapi import status
from sqlalchemy.orm import Session

from app.models.contact import ContactSubmission


def test_submit_contact_enquiry_success(api_client, api_db: Session):
    """Ensure a valid contact submission succeeds with 201 Created and returns expected structure."""
    payload = {
        "name": "Maya Raman",
        "email": "maya.raman@example.com",
        "phone": "+44 7700 900077",
        "enquiry_type": "Performance / Booking",
        "message": "We would love to organise a live classical storytelling performance at our venue in Birmingham.",
    }

    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()

    assert "id" in data
    assert data["name"] == "Maya Raman"
    assert data["email"] == "maya.raman@example.com"
    assert data["phone"] == "+44 7700 900077"
    assert data["enquiry_type"] == "Performance / Booking"
    assert data["status"] == "unread"
    assert "confirmation" in data

    # Verify database persistence
    db_item = api_db.query(ContactSubmission).filter(ContactSubmission.id == data["id"]).first()
    assert db_item is not None
    assert db_item.name == "Maya Raman"
    assert db_item.email == "maya.raman@example.com"
    assert db_item.status == "unread"


def test_submit_contact_with_frontend_camelcase_alias(api_client, api_db: Session):
    """Ensure frontend camelCase 'enquiryType' is accepted seamlessly via Pydantic alias."""
    payload = {
        "name": "David Miller",
        "email": "david.miller@schools.ac.uk",
        "enquiryType": "School Enquiry",
        "message": "Enquiring about booking a 3-day storytelling residency for Year 4 and 5 students.",
    }

    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()

    assert data["name"] == "David Miller"
    assert data["enquiry_type"] == "School Enquiry"

    db_item = api_db.query(ContactSubmission).filter(ContactSubmission.id == data["id"]).first()
    assert db_item is not None
    assert db_item.enquiry_type == "School Enquiry"


def test_submit_contact_missing_name_fails(api_client):
    """Submission missing required name field returns 422."""
    payload = {
        "email": "no.name@example.com",
        "message": "I am sending a message without a name field provided.",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_contact_short_name_fails(api_client):
    """Name with less than 2 characters is rejected with 422."""
    payload = {
        "name": "A",
        "email": "short.name@example.com",
        "message": "Valid length message requesting collaboration details.",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_contact_missing_email_fails(api_client):
    """Submission missing required email field returns 422."""
    payload = {
        "name": "Jane Doe",
        "message": "Hello, I would like to enquire about upcoming workshops.",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_contact_invalid_email_fails(api_client):
    """Malformed email returns 422."""
    payload = {
        "name": "Jane Doe",
        "email": "not-an-email-address",
        "message": "Hello, I would like to enquire about upcoming workshops.",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_contact_missing_message_fails(api_client):
    """Submission missing message field returns 422."""
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_contact_short_message_fails(api_client):
    """Message shorter than 10 characters returns 422."""
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "message": "Too short",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_contact_api_convenience_alias(api_client, api_db: Session):
    """Verify unversioned alias /api/contact functions identically to /api/v1/contact."""
    payload = {
        "name": "Alias Tester",
        "email": "alias.tester@example.com",
        "message": "Testing submission through unversioned convenience alias route.",
    }

    res = api_client.post("/api/contact", json=payload)
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json()["name"] == "Alias Tester"

from datetime import datetime, timedelta, timezone
from fastapi import status
from sqlalchemy.orm import Session

from app.models.event import Event, EventStatus


def _create_test_event(
    api_db: Session,
    title: str = "Diwali Classical Storytelling Evening",
    slug: str = "diwali-classical-evening",
    status_val: EventStatus = EventStatus.PUBLISHED,
    event_type: str = "performance",
    start_date: datetime = None,
    is_online: bool = False,
    featured: bool = False,
    storyteller_name: str = "Ananya Sharma",
    location: str = "Neasden Temple Cultural Hall, London",
) -> Event:
    if start_date is None:
        start_date = datetime.now(timezone.utc) + timedelta(days=7)

    event = Event(
        title=title,
        slug=slug,
        short_description="An enchanting evening of ancient Ramayana lore and classical music.",
        description="Join us for a mesmerizing celebration with classical sitar accompaniment.",
        hero_media="https://assets.storyhour.com/events/diwali-evening.jpg",
        event_type=event_type,
        status=status_val,
        start_date=start_date,
        end_date=start_date + timedelta(hours=3),
        time_display="6:30 PM - 9:30 PM GMT",
        location=location,
        venue_details="Hall A, Main entrance via Gate 2.",
        is_online=is_online,
        featured=featured,
        storyteller_name=storyteller_name,
        schedule=[
            {"time": "6:30 PM", "activity": "Welcome & Lamp Lighting"},
            {"time": "7:00 PM", "activity": "Oral Epic Performance"},
            {"time": "8:30 PM", "activity": "Q&A with Storyteller"},
        ],
        ticket_info="Free admission with RSVP. Seating is on a first-come basis.",
        registration_url="https://events.storyhour.com/rsvp/diwali",
        capacity=120,
    )
    api_db.add(event)
    api_db.commit()
    api_db.refresh(event)
    return event


def test_list_events_returns_only_published(api_client, api_db):
    """Ensure public events listing only returns PUBLISHED events."""
    _create_test_event(api_db, title="Published Circle", slug="pub-circle", status_val=EventStatus.PUBLISHED)
    _create_test_event(api_db, title="Draft Workshop", slug="draft-workshop", status_val=EventStatus.DRAFT)
    _create_test_event(api_db, title="Cancelled Gala", slug="cancelled-gala", status_val=EventStatus.CANCELLED)
    _create_test_event(api_db, title="Archived Reading", slug="archived-reading", status_val=EventStatus.ARCHIVED)

    res = api_client.get("/api/v1/events")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()

    assert len(data) == 1
    assert data[0]["slug"] == "pub-circle"
    assert data[0]["status"] == "PUBLISHED"


def test_list_events_pagination(api_client, api_db):
    """Ensure skip and limit pagination parameters are respected."""
    for i in range(5):
        _create_test_event(
            api_db,
            title=f"Storytelling Circle {i}",
            slug=f"circle-{i}",
            start_date=datetime.now(timezone.utc) + timedelta(days=i + 1),
        )

    res = api_client.get("/api/v1/events?skip=1&limit=2")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 2
    assert data[0]["slug"] == "circle-1"
    assert data[1]["slug"] == "circle-2"


def test_list_events_filter_event_type(api_client, api_db):
    """Filter events by event_type (e.g. workshop, circle, performance)."""
    _create_test_event(api_db, title="Puppet Skit Workshop", slug="puppet-workshop", event_type="workshop")
    _create_test_event(api_db, title="Epic Drama Show", slug="epic-drama", event_type="performance")

    res = api_client.get("/api/v1/events?event_type=workshop")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "puppet-workshop"
    assert data[0]["event_type"] == "workshop"


def test_list_events_filter_is_online(api_client, api_db):
    """Filter events by online or in-person mode."""
    _create_test_event(api_db, title="Global Zoom Circle", slug="zoom-circle", is_online=True)
    _create_test_event(api_db, title="London Hall Meetup", slug="london-meetup", is_online=False)

    res_online = api_client.get("/api/v1/events?is_online=true")
    assert res_online.status_code == status.HTTP_200_OK
    assert len(res_online.json()) == 1
    assert res_online.json()[0]["slug"] == "zoom-circle"

    res_in_person = api_client.get("/api/v1/events?is_online=false")
    assert res_in_person.status_code == status.HTTP_200_OK
    assert len(res_in_person.json()) == 1
    assert res_in_person.json()[0]["slug"] == "london-meetup"


def test_list_events_filter_featured(api_client, api_db):
    """Filter events by featured showcase status."""
    _create_test_event(api_db, title="Featured Festival", slug="featured-fest", featured=True)
    _create_test_event(api_db, title="Local Reading", slug="local-reading", featured=False)

    res = api_client.get("/api/v1/events?featured=true")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "featured-fest"


def test_list_events_filter_upcoming_only(api_client, api_db):
    """Ensure upcoming_only excludes past events."""
    past_date = datetime.now(timezone.utc) - timedelta(days=5)
    future_date = datetime.now(timezone.utc) + timedelta(days=5)

    _create_test_event(api_db, title="Past Gathering", slug="past-gathering", start_date=past_date)
    _create_test_event(api_db, title="Upcoming Gathering", slug="upcoming-gathering", start_date=future_date)

    res = api_client.get("/api/v1/events?upcoming_only=true")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "upcoming-gathering"


def test_list_events_search(api_client, api_db):
    """Search events by keywords across title, description, location, or storyteller."""
    _create_test_event(api_db, title="Mahabharata Recital", slug="recital-1", storyteller_name="Vikram Rao")
    _create_test_event(api_db, title="Panchatantra Circle", slug="circle-panchatantra", storyteller_name="Geeta Patel")

    res = api_client.get("/api/v1/events?search=Vikram")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "recital-1"


def test_get_event_by_slug_success(api_client, api_db):
    """Retrieve full event details by slug."""
    _create_test_event(api_db, title="Grand Epic Night", slug="grand-epic-night")

    res = api_client.get("/api/v1/events/grand-epic-night")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()

    assert data["title"] == "Grand Epic Night"
    assert data["slug"] == "grand-epic-night"
    assert "description" in data
    assert "schedule" in data
    assert len(data["schedule"]) == 3
    assert data["venue_details"] == "Hall A, Main entrance via Gate 2."
    assert data["ticket_info"] == "Free admission with RSVP. Seating is on a first-come basis."
    assert data["capacity"] == 120


def test_get_event_by_slug_not_found(api_client):
    """Non-existent slug returns 404."""
    res = api_client.get("/api/v1/events/non-existent-slug-xyz")
    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in res.json()["detail"].lower()


def test_get_event_by_slug_unpublished_hidden(api_client, api_db):
    """Draft or unpublished events return 404 on slug lookup."""
    _create_test_event(api_db, title="Secret Internal Reading", slug="secret-internal", status_val=EventStatus.DRAFT)

    res = api_client.get("/api/v1/events/secret-internal")
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_events_api_convenience_alias(api_client, api_db):
    """Verify unversioned alias /api/events functions identically to /api/v1/events."""
    _create_test_event(api_db, title="Alias Circle", slug="alias-circle")

    res = api_client.get("/api/events")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) >= 1

    res_detail = api_client.get("/api/events/alias-circle")
    assert res_detail.status_code == status.HTTP_200_OK
    assert res_detail.json()["slug"] == "alias-circle"

from datetime import datetime, timezone
from fastapi import status
from sqlalchemy.orm import Session

from app.models.journal import JournalArticle, JournalStatus


def _create_test_article(
    api_db: Session,
    title: str = "The Living Memory of the Ramayana",
    slug: str = "living-memory-ramayana",
    status_val: JournalStatus = JournalStatus.PUBLISHED,
    category: str = "Cultural Stories",
    tags: list = None,
    featured: bool = False,
    author_name: str = "Dr. Ananya Sharma",
) -> JournalArticle:
    if tags is None:
        tags = ["Oral Tradition", "Folklore", "Epics"]

    article = JournalArticle(
        title=title,
        slug=slug,
        short_description="An essay exploring how oral epics survive through generations of village bards.",
        content="Oral epics are not merely ancient texts; they are living, breathing communal memories recited under banyan trees...",
        hero_image="https://assets.storyhour.com/journal/living-memory.jpg",
        author_name=author_name,
        author_bio="Senior folklorist and contributing editor at StoryHour.",
        category=category,
        tags=tags,
        status=status_val,
        reading_time_minutes=6,
        featured=featured,
        publication_date=datetime.now(timezone.utc),
    )
    api_db.add(article)
    api_db.commit()
    api_db.refresh(article)
    return article


def test_list_journal_returns_only_published(api_client, api_db):
    """Ensure public journal listing only returns PUBLISHED articles."""
    _create_test_article(api_db, title="Published Essay", slug="pub-essay", status_val=JournalStatus.PUBLISHED)
    _create_test_article(api_db, title="Draft Interview", slug="draft-interview", status_val=JournalStatus.DRAFT)
    _create_test_article(api_db, title="In Review Piece", slug="review-piece", status_val=JournalStatus.REVIEW)
    _create_test_article(api_db, title="Archived Story", slug="archived-story", status_val=JournalStatus.ARCHIVED)

    res = api_client.get("/api/v1/journal")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()

    assert len(data) == 1
    assert data[0]["slug"] == "pub-essay"
    assert data[0]["status"] == "PUBLISHED"
    # Ensure lightweight summary listing excludes full article body content
    assert "content" not in data[0]


def test_list_journal_pagination(api_client, api_db):
    """Ensure skip and limit pagination parameters are respected."""
    for i in range(5):
        _create_test_article(api_db, title=f"Article {i}", slug=f"article-{i}")

    res = api_client.get("/api/v1/journal?skip=1&limit=2")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 2
    assert data[0]["slug"] == "article-3"
    assert data[1]["slug"] == "article-2"


def test_list_journal_filter_category(api_client, api_db):
    """Filter articles by editorial category."""
    _create_test_article(api_db, title="Folk Lore Piece", slug="folk-piece", category="Cultural Stories")
    _create_test_article(api_db, title="Artist Conversation", slug="artist-convo", category="Interviews")

    res = api_client.get("/api/v1/journal?category=Interviews")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "artist-convo"
    assert data[0]["category"] == "Interviews"


def test_list_journal_filter_tag(api_client, api_db):
    """Filter articles by topical tag."""
    _create_test_article(api_db, title="Puppetry Traditions", slug="puppetry-piece", tags=["Puppetry", "Shadow Art"])
    _create_test_article(api_db, title="Vocal Chants", slug="vocal-chants", tags=["Chanting", "Vedas"])

    res = api_client.get("/api/v1/journal?tag=Puppetry")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "puppetry-piece"


def test_list_journal_filter_featured(api_client, api_db):
    """Filter articles by featured showcase status."""
    _create_test_article(api_db, title="Leading Article", slug="lead-article", featured=True)
    _create_test_article(api_db, title="Standard Article", slug="std-article", featured=False)

    res = api_client.get("/api/v1/journal?featured=true")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "lead-article"


def test_list_journal_search(api_client, api_db):
    """Search articles across title, excerpt, and author name."""
    _create_test_article(api_db, title="Telangana Oral Epics", slug="telangana-epics", author_name="Kavita Reddy")
    _create_test_article(api_db, title="Bhojpuri Ballads", slug="bhojpuri-ballads", author_name="Ramesh Singh")

    res = api_client.get("/api/v1/journal?search=Kavita")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "telangana-epics"


def test_get_journal_by_slug_success(api_client, api_db):
    """Retrieve full article detail including content by slug."""
    _create_test_article(api_db, title="Detailed Essay", slug="detailed-essay")

    res = api_client.get("/api/v1/journal/detailed-essay")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()

    assert data["title"] == "Detailed Essay"
    assert data["slug"] == "detailed-essay"
    assert "content" in data
    assert "living, breathing communal memories" in data["content"]
    assert data["reading_time_minutes"] == 6
    assert data["author_name"] == "Dr. Ananya Sharma"


def test_get_journal_by_slug_not_found(api_client):
    """Non-existent slug returns 404."""
    res = api_client.get("/api/v1/journal/missing-slug-abc")
    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in res.json()["detail"].lower()


def test_get_journal_by_slug_unpublished_hidden(api_client, api_db):
    """Unpublished/draft articles return 404 on slug lookup."""
    _create_test_article(api_db, title="Secret Editorial Draft", slug="secret-draft", status_val=JournalStatus.DRAFT)

    res = api_client.get("/api/v1/journal/secret-draft")
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_journal_api_convenience_alias(api_client, api_db):
    """Verify unversioned alias /api/journal functions identically to /api/v1/journal."""
    _create_test_article(api_db, title="Alias Article", slug="alias-article")

    res = api_client.get("/api/journal")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) >= 1

    res_detail = api_client.get("/api/journal/alias-article")
    assert res_detail.status_code == status.HTTP_200_OK
    assert res_detail.json()["slug"] == "alias-article"

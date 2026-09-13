import pytest
from app.models.category import Category
from app.models.chapter import Chapter
from app.models.language import Language
from app.models.story import Story, StoryStatus


def test_list_stories_returns_only_published(api_client, api_db):
    """Verify public stories listing only returns PUBLISHED status stories."""
    s1 = Story(title="Published Tale", slug="published-tale", status=StoryStatus.PUBLISHED)
    s2 = Story(title="Draft Tale", slug="draft-tale", status=StoryStatus.DRAFT)
    s3 = Story(title="Review Tale", slug="review-tale", status=StoryStatus.REVIEW)
    s4 = Story(title="Archived Tale", slug="archived-tale", status=StoryStatus.ARCHIVED)
    api_db.add_all([s1, s2, s3, s4])
    api_db.commit()

    res = api_client.get("/api/v1/stories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "published-tale"
    assert data[0]["status"] == "PUBLISHED"


def test_list_stories_pagination(api_client, api_db):
    """Verify limit and skip pagination on stories listing."""
    stories = [
        Story(title=f"Story {i}", slug=f"story-{i}", status=StoryStatus.PUBLISHED)
        for i in range(5)
    ]
    api_db.add_all(stories)
    api_db.commit()

    # Limit = 2
    res = api_client.get("/api/v1/stories?limit=2")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2

    # Skip = 2, Limit = 2
    res_page2 = api_client.get("/api/v1/stories?skip=2&limit=2")
    assert res_page2.status_code == 200
    data_page2 = res_page2.json()
    assert len(data_page2) == 2
    assert data_page2[0]["slug"] != data[0]["slug"]


def test_list_stories_category_filter(api_client, api_db):
    """Verify filtering stories by category slug."""
    cat_mythology = Category(name="Mythology", slug="mythology")
    cat_folklore = Category(name="Folklore", slug="folklore")
    api_db.add_all([cat_mythology, cat_folklore])
    api_db.commit()

    s1 = Story(title="Ramayana Epic", slug="ramayana-epic", status=StoryStatus.PUBLISHED)
    s1.categories.append(cat_mythology)
    s2 = Story(title="Panchatantra Fables", slug="panchatantra-fables", status=StoryStatus.PUBLISHED)
    s2.categories.append(cat_folklore)
    api_db.add_all([s1, s2])
    api_db.commit()

    res = api_client.get("/api/v1/stories?category=mythology")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "ramayana-epic"


def test_list_stories_language_filter(api_client, api_db):
    """Verify filtering stories by language ISO code."""
    lang_hi = Language(name="Hindi", code="hi", native_name="हिन्दी")
    lang_en = Language(name="English", code="en", native_name="English")
    api_db.add_all([lang_hi, lang_en])
    api_db.commit()

    s1 = Story(title="Hindi Lore", slug="hindi-lore", status=StoryStatus.PUBLISHED)
    s1.languages.append(lang_hi)
    s2 = Story(title="English Lore", slug="english-lore", status=StoryStatus.PUBLISHED)
    s2.languages.append(lang_en)
    api_db.add_all([s1, s2])
    api_db.commit()

    res = api_client.get("/api/v1/stories?language=hi")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "hindi-lore"


def test_list_stories_search(api_client, api_db):
    """Verify textual search across story title and hook."""
    s1 = Story(
        title="The Tale of Krishna",
        slug="tale-of-krishna",
        short_description="Adventures of the divine hero.",
        status=StoryStatus.PUBLISHED,
    )
    s2 = Story(
        title="Forest Spirits",
        slug="forest-spirits",
        short_description="Legends of wilderness.",
        status=StoryStatus.PUBLISHED,
    )
    api_db.add_all([s1, s2])
    api_db.commit()

    res = api_client.get("/api/v1/stories?search=krishna")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "tale-of-krishna"


def test_list_stories_featured_filter(api_client, api_db):
    """Verify filtering by featured showcase boolean."""
    s1 = Story(title="Featured Story", slug="featured-story", featured=True, status=StoryStatus.PUBLISHED)
    s2 = Story(title="Regular Story", slug="regular-story", featured=False, status=StoryStatus.PUBLISHED)
    api_db.add_all([s1, s2])
    api_db.commit()

    res = api_client.get("/api/v1/stories?featured=true")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "featured-story"


def test_list_stories_combined_filters(api_client, api_db):
    """Verify combination of category, language, and search filters."""
    cat = Category(name="Epic", slug="epic")
    lang = Language(name="Telugu", code="te")
    api_db.add_all([cat, lang])
    api_db.commit()

    s1 = Story(
        title="Mahabharata Kurukshetra",
        slug="mahabharata-kurukshetra",
        featured=True,
        status=StoryStatus.PUBLISHED,
    )
    s1.categories.append(cat)
    s1.languages.append(lang)

    s2 = Story(
        title="Mahabharata Virata",
        slug="mahabharata-virata",
        featured=False,
        status=StoryStatus.PUBLISHED,
    )
    s2.categories.append(cat)
    s2.languages.append(lang)

    api_db.add_all([s1, s2])
    api_db.commit()

    res = api_client.get("/api/v1/stories?category=epic&language=te&search=Kurukshetra&featured=true")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "mahabharata-kurukshetra"


def test_get_story_by_slug_success(api_client, api_db):
    """Verify retrieving full story detail by slug including relations."""
    cat = Category(name="Myth", slug="myth")
    lang = Language(name="English", code="en")
    api_db.add_all([cat, lang])
    api_db.commit()

    story = Story(
        title="Immortal Deeds",
        slug="immortal-deeds",
        short_description="Short hook",
        long_description="Long narrative text",
        status=StoryStatus.PUBLISHED,
        themes=["Courage", "Duty"],
    )
    story.categories.append(cat)
    story.languages.append(lang)
    api_db.add(story)
    api_db.commit()

    ch1 = Chapter(story_id=story.id, title="Prologue", order=1, duration=300)
    api_db.add(ch1)
    api_db.commit()

    res = api_client.get("/api/v1/stories/immortal-deeds")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Immortal Deeds"
    assert data["slug"] == "immortal-deeds"
    assert len(data["categories"]) == 1
    assert data["categories"][0]["slug"] == "myth"
    assert len(data["languages"]) == 1
    assert data["languages"][0]["code"] == "en"
    assert len(data["chapters"]) == 1
    assert data["chapters"][0]["title"] == "Prologue"


def test_get_story_by_slug_not_found(api_client):
    """Verify 404 response for non-existent story slug."""
    res = api_client.get("/api/v1/stories/non-existent-slug-xyz")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_get_story_by_slug_unpublished_hidden(api_client, api_db):
    """Verify draft stories return 404 on public slug lookup."""
    draft_story = Story(
        title="Secret Draft",
        slug="secret-draft",
        status=StoryStatus.DRAFT,
    )
    api_db.add(draft_story)
    api_db.commit()

    res = api_client.get("/api/v1/stories/secret-draft")
    assert res.status_code == 404


def test_get_story_chapters_explicit_ordering(api_client, api_db):
    """Verify chapters are returned in database-driven ascending order 1, 2, 3."""
    story = Story(
        title="Sita's Journey",
        slug="sitas-journey",
        status=StoryStatus.PUBLISHED,
    )
    api_db.add(story)
    api_db.commit()

    # Insert out of order: 3, 1, 2
    ch3 = Chapter(story_id=story.id, title="Chapter Three", order=3, duration=300)
    ch1 = Chapter(story_id=story.id, title="Chapter One", order=1, duration=200)
    ch2 = Chapter(story_id=story.id, title="Chapter Two", order=2, duration=250)
    api_db.add_all([ch3, ch1, ch2])
    api_db.commit()

    res = api_client.get("/api/v1/stories/sitas-journey/chapters")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 3
    assert [c["order"] for c in data] == [1, 2, 3]
    assert data[0]["title"] == "Chapter One"
    assert data[1]["title"] == "Chapter Two"
    assert data[2]["title"] == "Chapter Three"


def test_get_story_chapters_not_found(api_client):
    """Verify 404 for chapters of non-existent story."""
    res = api_client.get("/api/v1/stories/non-existent-story/chapters")
    assert res.status_code == 404


def test_get_story_chapters_unpublished_hidden(api_client, api_db):
    """Verify 404 for chapters of unpublished draft story."""
    story = Story(
        title="Draft Story With Chapters",
        slug="draft-story-chapters",
        status=StoryStatus.DRAFT,
    )
    api_db.add(story)
    api_db.commit()

    ch = Chapter(story_id=story.id, title="Hidden Chapter", order=1)
    api_db.add(ch)
    api_db.commit()

    res = api_client.get("/api/v1/stories/draft-story-chapters/chapters")
    assert res.status_code == 404


def test_stories_api_convenience_alias(api_client, api_db):
    """Verify both /api/v1/stories and /api/stories work identically."""
    story = Story(title="Aliased Story", slug="aliased-story", status=StoryStatus.PUBLISHED)
    api_db.add(story)
    api_db.commit()

    res_v1 = api_client.get("/api/v1/stories")
    res_root = api_client.get("/api/stories")
    assert res_v1.status_code == 200
    assert res_root.status_code == 200
    assert res_v1.json() == res_root.json()

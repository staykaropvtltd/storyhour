import pytest
from sqlalchemy.exc import IntegrityError

from app.models.category import Category
from app.models.language import Language
from app.models.story import Story, StoryStatus
from app.models.chapter import Chapter
from app.models.audio_asset import AudioAsset, AudioAccessType
from app.repositories.category import CategoryRepository
from app.repositories.language import LanguageRepository
from app.repositories.story import StoryRepository
from app.repositories.chapter import ChapterRepository
from app.services.story_service import StoryService


def test_category_creation_and_constraints(db_session):
    """Test category model creation, slug uniqueness, and repository queries."""
    category_repo = CategoryRepository()

    cat = Category(
        name="Indian Mythology",
        slug="indian-mythology",
        description="Tales and legends of deities and sages.",
        is_active=True,
    )
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)

    assert cat.id is not None
    assert len(cat.id) == 36
    assert cat.created_at is not None
    assert cat.updated_at is not None
    assert cat.is_active is True

    # Retrieve by id & slug
    found = category_repo.get_by_id(db_session, cat.id)
    assert found is not None
    assert found.slug == "indian-mythology"

    found_by_slug = category_repo.get_by_slug(db_session, "indian-mythology")
    assert found_by_slug is not None
    assert found_by_slug.name == "Indian Mythology"

    # Test list and list_categories
    cats = category_repo.list(db_session)
    assert len(cats) == 1
    assert cats[0].slug == "indian-mythology"

    cats_alias = category_repo.list_categories(db_session)
    assert len(cats_alias) == 1

    # Slug uniqueness constraint
    duplicate = Category(name="Another Mythology", slug="indian-mythology")
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_language_creation_and_constraints(db_session):
    """Test language model creation, code uniqueness, and repository queries."""
    language_repo = LanguageRepository()

    lang = Language(
        name="Telugu",
        code="te",
        native_name="తెలుగు",
        is_active=True,
    )
    db_session.add(lang)
    db_session.commit()
    db_session.refresh(lang)

    assert lang.id is not None
    assert len(lang.id) == 36
    assert lang.name == "Telugu"
    assert lang.code == "te"
    assert lang.native_name == "తెలుగు"

    # Retrieve by id & code
    found = language_repo.get_by_id(db_session, lang.id)
    assert found is not None
    assert found.code == "te"

    found_code = language_repo.get_by_code(db_session, "TE")  # case-insensitive check
    assert found_code is not None
    assert found_code.name == "Telugu"

    # Test list and list_languages
    langs = language_repo.list(db_session)
    assert len(langs) == 1
    assert langs[0].code == "te"

    langs_alias = language_repo.list_languages(db_session)
    assert len(langs_alias) == 1

    # Unique code constraint
    duplicate = Language(name="Telugu Dialect", code="te")
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_story_creation_and_lifecycle(db_session):
    """Test story model attributes, duration in seconds, status, and repository queries."""
    story_repo = StoryRepository()

    story = Story(
        title="Ramayana: The Epic Journey",
        slug="ramayana-epic-journey",
        short_description="An ancient Sanskrit epic.",
        long_description="The heroic tale of Prince Rama, Sita, and Lakshmana.",
        status=StoryStatus.PUBLISHED,
        themes=["Dharma", "Courage", "Loyalty"],
        narrator="Harish Bhimani",
        duration=51600,  # 860 minutes = 51600 seconds
        age_group="All Ages",
        cultural_context="Ancient Indian Itihasa",
        featured=True,
        seo_title="Ramayana Audiobook",
        seo_description="Listen to the epic Ramayana.",
    )
    db_session.add(story)
    db_session.commit()
    db_session.refresh(story)

    assert story.id is not None
    assert len(story.id) == 36
    assert story.status == StoryStatus.PUBLISHED
    assert story.duration == 51600
    assert story.featured is True
    assert story.themes == ["Dharma", "Courage", "Loyalty"]
    assert story.created_at is not None

    # Fetch via repository
    fetched = story_repo.get_by_id(db_session, story.id)
    assert fetched is not None
    assert fetched.slug == "ramayana-epic-journey"

    fetched_slug = story_repo.get_by_slug(db_session, "ramayana-epic-journey")
    assert fetched_slug is not None

    # Filter stories by status and featured
    published_stories = story_repo.list_stories(
        db_session, status=StoryStatus.PUBLISHED, featured=True
    )
    assert len(published_stories) == 1

    draft_stories = story_repo.list_stories(db_session, status=StoryStatus.DRAFT)
    assert len(draft_stories) == 0

    # Unique slug constraint
    duplicate_story = Story(
        title="Another Ramayana",
        slug="ramayana-epic-journey",
    )
    db_session.add(duplicate_story)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_story_associations(db_session):
    """Test many-to-many relationships: Story <-> Categories and Story <-> Languages."""
    story_repo = StoryRepository()

    story = Story(title="Mahabharata", slug="mahabharata")
    cat1 = Category(name="Epics", slug="epics")
    cat2 = Category(name="Folklore", slug="folklore")
    lang_hi = Language(name="Hindi", code="hi", native_name="हिन्दी")
    lang_en = Language(name="English", code="en")

    db_session.add_all([story, cat1, cat2, lang_hi, lang_en])
    db_session.commit()

    # Use repository attach methods
    story_repo.attach_category(db_session, story, cat1)
    story_repo.attach_category(db_session, story, cat2)
    story_repo.attach_language(db_session, story, lang_hi)
    story_repo.attach_language(db_session, story, lang_en)

    db_session.refresh(story)
    assert len(story.categories) == 2
    category_slugs = [c.slug for c in story.categories]
    assert "epics" in category_slugs
    assert "folklore" in category_slugs

    assert len(story.languages) == 2
    language_codes = [l.code for l in story.languages]
    assert "hi" in language_codes
    assert "en" in language_codes

    # Verify back-populates from Category and Language
    assert len(cat1.stories) == 1
    assert cat1.stories[0].slug == "mahabharata"
    assert len(lang_hi.stories) == 1
    assert lang_hi.stories[0].slug == "mahabharata"


def test_chapter_order_and_scrambled_insertion(db_session):
    """
    CRITICAL ORDERING TEST:
    Insert chapters in deliberately scrambled order (order 3, then 1, then 2).
    Query via ChapterRepository and Story.chapters relationship.
    Assert they are returned in exact ascending order [1, 2, 3].
    """
    chapter_repo = ChapterRepository()

    story = Story(title="Panchatantra", slug="panchatantra")
    db_session.add(story)
    db_session.commit()

    # Insert scrambled: 3, 1, 2
    ch3 = Chapter(
        story_id=story.id,
        title="Chapter 3: The Crows and the Owls",
        order=3,
        start_time=1200,
        duration=600,
        preview_available=False,
    )
    ch1 = Chapter(
        story_id=story.id,
        title="Chapter 1: The Loss of Friends",
        order=1,
        start_time=0,
        duration=550,
        preview_available=True,
    )
    ch2 = Chapter(
        story_id=story.id,
        title="Chapter 2: The Winning of Friends",
        order=2,
        start_time=550,
        duration=650,
        preview_available=False,
    )

    db_session.add_all([ch3, ch1, ch2])
    db_session.commit()

    # Query via ChapterRepository.get_by_story()
    ordered_chapters = chapter_repo.get_by_story(db_session, story.id)
    assert len(ordered_chapters) == 3
    assert [ch.order for ch in ordered_chapters] == [1, 2, 3]
    assert ordered_chapters[0].title == "Chapter 1: The Loss of Friends"
    assert ordered_chapters[1].title == "Chapter 2: The Winning of Friends"
    assert ordered_chapters[2].title == "Chapter 3: The Crows and the Owls"

    # Query via Story.chapters relationship
    db_session.expire_all()
    reloaded_story = db_session.query(Story).filter(Story.id == story.id).first()
    assert [ch.order for ch in reloaded_story.chapters] == [1, 2, 3]

    # Query specific chapter by order
    ch_order_2 = chapter_repo.get_by_story_and_order(db_session, story.id, order=2)
    assert ch_order_2 is not None
    assert ch_order_2.title == "Chapter 2: The Winning of Friends"

    # Verify unique constraint on (story_id, order)
    duplicate_order_chapter = Chapter(
        story_id=story.id,
        title="Conflicting Chapter",
        order=1,  # Duplicate of order 1
        start_time=100,
        duration=200,
    )
    db_session.add(duplicate_order_chapter)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_story_cascade_deletion(db_session):
    """Verify deleting a story cascades to its chapters and audio assets, but keeps taxonomy."""
    story = Story(title="Jataka Tales", slug="jataka-tales")
    category = Category(name="Buddhist Lore", slug="buddhist-lore")
    language = Language(name="Pali", code="pi")
    db_session.add_all([story, category, language])
    db_session.commit()

    story.categories.append(category)
    story.languages.append(language)

    chapter = Chapter(story_id=story.id, title="The Golden Swan", order=1)
    db_session.add(chapter)
    db_session.commit()

    audio = AudioAsset(
        story_id=story.id,
        chapter_id=chapter.id,
        storage_key="audio/jataka/swan.mp3",
        duration=300,
        access_type=AudioAccessType.PUBLIC_PREVIEW,
    )
    db_session.add(audio)
    db_session.commit()

    chapter_id = chapter.id
    audio_id = audio.id
    cat_id = category.id
    lang_id = language.id

    # Delete story
    db_session.delete(story)
    db_session.commit()

    # Chapter and AudioAsset must be deleted
    assert db_session.query(Chapter).filter(Chapter.id == chapter_id).first() is None
    assert db_session.query(AudioAsset).filter(AudioAsset.id == audio_id).first() is None

    # Category and Language must NOT be deleted
    assert db_session.query(Category).filter(Category.id == cat_id).first() is not None
    assert db_session.query(Language).filter(Language.id == lang_id).first() is not None


def test_story_service(db_session):
    """Test StoryService operations, state validation, and published-only filtering."""
    service = StoryService()

    draft_story = Story(
        title="Draft Story",
        slug="draft-story",
        status=StoryStatus.DRAFT,
        featured=False,
    )
    published_story = Story(
        title="Published Hero Story",
        slug="published-hero-story",
        status=StoryStatus.PUBLISHED,
        featured=True,
    )
    db_session.add_all([draft_story, published_story])
    db_session.commit()

    # Content lifecycle validation
    assert service.validate_content_state(draft_story) is False
    assert service.validate_content_state(published_story) is True

    # get_story_by_slug with published_only=True
    assert service.get_story_by_slug(db_session, "draft-story", published_only=True) is None
    assert service.get_story_by_slug(db_session, "draft-story", published_only=False) is not None

    found_pub = service.get_story_by_slug(
        db_session, "published-hero-story", published_only=True
    )
    assert found_pub is not None
    assert found_pub.title == "Published Hero Story"

    # List published stories
    published_list = service.list_published_stories(db_session, featured=True)
    assert len(published_list) == 1
    assert published_list[0].slug == "published-hero-story"

from app.models.audio_asset import AudioAccessType, AudioAsset
from app.models.chapter import Chapter
from app.models.story import Story
from app.repositories.audio import AudioRepository
from app.services.audio_service import AudioService


def test_audio_asset_creation_and_attributes(db_session):
    """Test AudioAsset model fields, duration in seconds, and safe storage key."""
    audio_repo = AudioRepository()

    story = Story(title="Audio Story", slug="audio-story")
    db_session.add(story)
    db_session.commit()

    asset = AudioAsset(
        story_id=story.id,
        storage_key="content/audio/audio-story/intro.mp3",
        duration=180,  # 3 minutes = 180 seconds
        mime_type="audio/mpeg",
        access_type=AudioAccessType.PUBLIC_PREVIEW,
    )
    db_session.add(asset)
    db_session.commit()
    db_session.refresh(asset)

    assert asset.id is not None
    assert len(asset.id) == 36
    assert asset.duration == 180
    assert asset.mime_type == "audio/mpeg"
    assert asset.access_type == AudioAccessType.PUBLIC_PREVIEW
    assert asset.storage_key == "content/audio/audio-story/intro.mp3"
    assert asset.chapter_id is None

    # Retrieve via AudioRepository
    found = audio_repo.get_by_id(db_session, asset.id)
    assert found is not None
    assert found.storage_key == "content/audio/audio-story/intro.mp3"

    story_assets = audio_repo.get_by_story(db_session, story.id)
    assert len(story_assets) == 1
    assert story_assets[0].id == asset.id

    preview_asset = audio_repo.get_story_preview_asset(db_session, story.id)
    assert preview_asset is not None
    assert preview_asset.id == asset.id


def test_audio_asset_chapter_relationship_and_set_null(db_session):
    """Test AudioAsset relationship to Chapter, and ON DELETE SET NULL behavior."""
    audio_repo = AudioRepository()

    story = Story(title="Tales of Vikram", slug="tales-of-vikram")
    db_session.add(story)
    db_session.commit()

    chapter = Chapter(
        story_id=story.id,
        title="Betal Riddle 1",
        order=1,
        duration=420,
        preview_available=True,
    )
    db_session.add(chapter)
    db_session.commit()

    asset = AudioAsset(
        story_id=story.id,
        chapter_id=chapter.id,
        storage_key="content/vikram/riddle1.mp3",
        duration=420,
        mime_type="audio/mp3",
        access_type=AudioAccessType.PROTECTED,
    )
    db_session.add(asset)
    db_session.commit()
    db_session.refresh(asset)

    assert asset.chapter is not None
    assert asset.chapter.title == "Betal Riddle 1"

    # Query by chapter via repository
    chapter_assets = audio_repo.get_by_chapter(db_session, chapter.id)
    assert len(chapter_assets) == 1
    assert chapter_assets[0].id == asset.id

    # Deleting chapter sets chapter_id to NULL on asset (SET NULL)
    asset_id = asset.id
    db_session.delete(chapter)
    db_session.commit()

    reloaded_asset = db_session.query(AudioAsset).filter(AudioAsset.id == asset_id).first()
    assert reloaded_asset is not None
    assert reloaded_asset.chapter_id is None


def test_audio_service_security_boundary(db_session):
    """
    Test AudioService security boundary:
    1. PUBLIC_PREVIEW asset is accessible without entitlement.
    2. PROTECTED asset with chapter preview_available=True is accessible.
    3. PROTECTED asset with chapter preview_available=False and no entitlement is inaccessible (stream_url is None).
    4. Entitled user can access PROTECTED asset.
    5. No storage credentials or secret keys are exposed in descriptor or model dict.
    """
    audio_service = AudioService()

    story = Story(title="Security Test Story", slug="sec-test-story")
    db_session.add(story)
    db_session.commit()

    ch_preview = Chapter(
        story_id=story.id,
        title="Preview Chapter",
        order=1,
        preview_available=True,
    )
    ch_locked = Chapter(
        story_id=story.id,
        title="Locked Chapter",
        order=2,
        preview_available=False,
    )
    db_session.add_all([ch_preview, ch_locked])
    db_session.commit()

    # Asset 1: PUBLIC_PREVIEW directly on asset
    asset_public = AudioAsset(
        story_id=story.id,
        chapter_id=ch_locked.id,
        storage_key="vault/audio/public_teaser.mp3",
        duration=60,
        access_type=AudioAccessType.PUBLIC_PREVIEW,
    )
    # Asset 2: PROTECTED asset under preview-enabled chapter
    asset_ch_preview = AudioAsset(
        story_id=story.id,
        chapter_id=ch_preview.id,
        storage_key="vault/audio/chapter_preview.mp3",
        duration=300,
        access_type=AudioAccessType.PROTECTED,
    )
    # Asset 3: PROTECTED asset under locked chapter
    asset_locked = AudioAsset(
        story_id=story.id,
        chapter_id=ch_locked.id,
        storage_key="vault/audio/premium_deep.mp3",
        duration=1200,
        access_type=AudioAccessType.PROTECTED,
    )

    db_session.add_all([asset_public, asset_ch_preview, asset_locked])
    db_session.commit()

    # 1. Check is_preview_allowed
    assert audio_service.is_preview_allowed(asset_public) is True
    assert audio_service.is_preview_allowed(asset_ch_preview) is True
    assert audio_service.is_preview_allowed(asset_locked) is False

    # 2. Descriptor for public preview (unentitled)
    desc_public = audio_service.prepare_playback_descriptor(asset_public, is_entitled=False)
    assert desc_public.is_accessible is True
    assert desc_public.stream_url == f"/api/audio/stream/{asset_public.id}"

    # 3. Descriptor for chapter-enabled preview (unentitled)
    desc_ch_preview = audio_service.prepare_playback_descriptor(asset_ch_preview, is_entitled=False)
    assert desc_ch_preview.is_accessible is True
    assert desc_ch_preview.stream_url == f"/api/audio/stream/{asset_ch_preview.id}"

    # 4. Descriptor for locked asset without entitlement -> inaccessible, stream_url is None
    desc_locked = audio_service.prepare_playback_descriptor(asset_locked, is_entitled=False)
    assert desc_locked.is_accessible is False
    assert desc_locked.stream_url is None

    # 5. Descriptor for locked asset WITH entitlement -> accessible
    desc_unlocked = audio_service.prepare_playback_descriptor(asset_locked, is_entitled=True)
    assert desc_unlocked.is_accessible is True
    assert desc_unlocked.stream_url == f"/api/audio/stream/{asset_locked.id}"

    # 6. Verify security integrity: No credentials leaked in schemas or dictionaries
    descriptor_dict = desc_unlocked.model_dump()
    forbidden_keys = ["secret", "password", "aws_secret", "supabase_key", "bucket_secret", "private_key"]
    for key in descriptor_dict:
        assert not any(forbidden in key.lower() for forbidden in forbidden_keys)

    # storage_key is not in playback descriptor
    assert "storage_key" not in descriptor_dict

    # asset dictionary does not contain sensitive backend credentials
    asset_dict = asset_locked.to_dict()
    for key in asset_dict:
        assert not any(forbidden in key.lower() for forbidden in forbidden_keys)

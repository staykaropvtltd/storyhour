from typing import Optional
from sqlalchemy.orm import Session

from app.models.audio_asset import AudioAccessType, AudioAsset
from app.repositories.audio import AudioRepository
from app.schemas.audio import AudioPlaybackDescriptor


class AudioService:
    """
    Business service layer managing audio security, playback descriptors,
    and access boundary enforcement without exposing private credentials.
    """

    def __init__(self, audio_repo: Optional[AudioRepository] = None):
        self.audio_repo = audio_repo or AudioRepository()

    def get_audio_metadata(self, db: Session, audio_id: str) -> Optional[AudioAsset]:
        """Retrieve safe audio asset metadata record."""
        return self.audio_repo.get_by_id(db, audio_id)

    def is_preview_allowed(self, asset: AudioAsset) -> bool:
        """
        Determine whether an asset qualifies for unrestricted public preview.
        Returns True if the asset itself is classified as PUBLIC_PREVIEW or if
        its linked chapter is marked as preview_available.
        """
        if asset.access_type == AudioAccessType.PUBLIC_PREVIEW:
            return True
        if asset.chapter and asset.chapter.preview_available:
            return True
        return False

    def prepare_playback_descriptor(
        self,
        asset: AudioAsset,
        is_entitled: bool = False,
    ) -> AudioPlaybackDescriptor:
        """
        Generate a secure playback descriptor for the frontend player.
        Enforces access boundary:
        - If entitled or preview allowed: is_accessible is True.
        - If protected and not entitled: is_accessible is False (stream URL withheld).
        Never exposes S3/Supabase storage credentials, signed secret keys, or private paths.
        """
        preview_allowed = self.is_preview_allowed(asset)
        accessible = preview_allowed or is_entitled

        # In Phase 1, stream_url is synthesized only as a sanitized safe URL path if authorized
        safe_stream_url = (
            f"/api/audio/stream/{asset.id}" if accessible else None
        )

        return AudioPlaybackDescriptor(
            asset_id=asset.id,
            story_id=asset.story_id,
            chapter_id=asset.chapter_id,
            duration=asset.duration,
            mime_type=asset.mime_type,
            access_type=asset.access_type,
            is_accessible=accessible,
            stream_url=safe_stream_url,
        )

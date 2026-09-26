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

    def list_assets(
        self,
        db: Session,
        *,
        story_id: Optional[str] = None,
        chapter_id: Optional[str] = None,
        access_type: Optional[AudioAccessType] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AudioAsset]:
        """List audio media assets for administrative management."""
        return self.audio_repo.list_assets(
            db,
            story_id=story_id,
            chapter_id=chapter_id,
            access_type=access_type,
            skip=skip,
            limit=limit,
        )

    def create_asset(self, db: Session, payload: "AudioAssetCreate") -> AudioAsset:
        """Register a new audio asset record and commit."""
        asset_data = payload.model_dump()
        asset = AudioAsset(**asset_data)
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    def update_asset(self, db: Session, asset: AudioAsset, payload: "AudioAssetUpdate") -> AudioAsset:
        """Update existing audio asset metadata and commit."""
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(asset, key, value)
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    def delete_asset(self, db: Session, asset: AudioAsset) -> None:
        """Permanently delete an audio asset record and commit."""
        db.delete(asset)
        db.commit()

"""create phase5 analytics and media

Revision ID: f5a8210d7e42
Revises: 2742d1b551e8
Create Date: 2026-09-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f5a8210d7e42"
down_revision: Union[str, Sequence[str], None] = "2742d1b551e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create analytics_events table and add file_size to audio_assets."""
    # 1. analytics_events
    op.create_table(
        "analytics_events",
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=True),
        sa.Column("session_id", sa.String(length=128), nullable=True),
        sa.Column("properties", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analytics_events_id", "analytics_events", ["id"], unique=False)
    op.create_index("ix_analytics_events_event_type", "analytics_events", ["event_type"], unique=False)
    op.create_index("ix_analytics_events_user_id", "analytics_events", ["user_id"], unique=False)
    op.create_index("ix_analytics_events_session_id", "analytics_events", ["session_id"], unique=False)
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"], unique=False)

    # 2. audio_assets file_size
    op.add_column("audio_assets", sa.Column("file_size", sa.Integer(), nullable=True))


def downgrade() -> None:
    """Drop analytics_events table and remove file_size from audio_assets."""
    op.drop_column("audio_assets", "file_size")
    op.drop_index("ix_analytics_events_created_at", table_name="analytics_events")
    op.drop_index("ix_analytics_events_session_id", table_name="analytics_events")
    op.drop_index("ix_analytics_events_user_id", table_name="analytics_events")
    op.drop_index("ix_analytics_events_event_type", table_name="analytics_events")
    op.drop_index("ix_analytics_events_id", table_name="analytics_events")
    op.drop_table("analytics_events")

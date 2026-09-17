"""create phase4 events journal contact

Revision ID: c5e8210f9831
Revises: b062db00f120
Create Date: 2026-09-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c5e8210f9831"
down_revision: Union[str, Sequence[str], None] = "b062db00f120"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create events, journal_articles, and contact_submissions tables."""

    # 1. events
    op.create_table(
        "events",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("hero_media", sa.String(length=1024), nullable=True),
        sa.Column("event_type", sa.String(length=64), nullable=False, server_default="performance"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="DRAFT"),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("time_display", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("venue_details", sa.Text(), nullable=True),
        sa.Column("is_online", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("storyteller_name", sa.String(length=255), nullable=True),
        sa.Column("schedule", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("ticket_info", sa.String(length=255), nullable=True),
        sa.Column("registration_url", sa.String(length=1024), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_events_slug"),
    )
    op.create_index("ix_events_id", "events", ["id"], unique=False)
    op.create_index("ix_events_slug", "events", ["slug"], unique=True)
    op.create_index("ix_events_event_type", "events", ["event_type"], unique=False)
    op.create_index("ix_events_status", "events", ["status"], unique=False)
    op.create_index("ix_events_start_date", "events", ["start_date"], unique=False)
    op.create_index("ix_events_is_online", "events", ["is_online"], unique=False)
    op.create_index("ix_events_featured", "events", ["featured"], unique=False)
    op.create_index("ix_events_is_deleted", "events", ["is_deleted"], unique=False)
    op.create_index("ix_events_created_at", "events", ["created_at"], unique=False)

    # 2. journal_articles
    op.create_table(
        "journal_articles",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("hero_image", sa.String(length=1024), nullable=True),
        sa.Column("author_name", sa.String(length=255), nullable=False),
        sa.Column("author_bio", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="DRAFT"),
        sa.Column("reading_time_minutes", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("publication_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_journal_articles_slug"),
    )
    op.create_index("ix_journal_articles_id", "journal_articles", ["id"], unique=False)
    op.create_index("ix_journal_articles_slug", "journal_articles", ["slug"], unique=True)
    op.create_index("ix_journal_articles_category", "journal_articles", ["category"], unique=False)
    op.create_index("ix_journal_articles_status", "journal_articles", ["status"], unique=False)
    op.create_index("ix_journal_articles_featured", "journal_articles", ["featured"], unique=False)
    op.create_index("ix_journal_articles_publication_date", "journal_articles", ["publication_date"], unique=False)
    op.create_index("ix_journal_articles_is_deleted", "journal_articles", ["is_deleted"], unique=False)
    op.create_index("ix_journal_articles_created_at", "journal_articles", ["created_at"], unique=False)

    # 3. contact_submissions
    op.create_table(
        "contact_submissions",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("enquiry_type", sa.String(length=100), nullable=False, server_default="General Enquiry"),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="unread"),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_contact_submissions_id", "contact_submissions", ["id"], unique=False)
    op.create_index("ix_contact_submissions_email", "contact_submissions", ["email"], unique=False)
    op.create_index("ix_contact_submissions_enquiry_type", "contact_submissions", ["enquiry_type"], unique=False)
    op.create_index("ix_contact_submissions_status", "contact_submissions", ["status"], unique=False)
    op.create_index("ix_contact_submissions_created_at", "contact_submissions", ["created_at"], unique=False)


def downgrade() -> None:
    """Drop events, journal_articles, and contact_submissions tables."""
    op.drop_table("contact_submissions")
    op.drop_table("journal_articles")
    op.drop_table("events")

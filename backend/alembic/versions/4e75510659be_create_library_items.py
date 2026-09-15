"""create library items

Revision ID: 4e75510659be
Revises: 1903cc6bc805
Create Date: 2026-09-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4e75510659be"
down_revision: Union[str, Sequence[str], None] = "1903cc6bc805"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create library_items table."""

    op.create_table(
        "library_items",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("story_id", sa.String(length=36), nullable=False),
        sa.Column(
            "access_type",
            sa.String(length=32),
            nullable=False,
            server_default="purchased",
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column("source_order_id", sa.String(length=36), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["story_id"],
            ["stories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "story_id",
            name="uq_user_story_library",
        ),
    )

    op.create_index(
        "ix_library_items_id",
        "library_items",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_library_items_user_id",
        "library_items",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_library_items_story_id",
        "library_items",
        ["story_id"],
        unique=False,
    )
    op.create_index(
        "ix_library_items_is_active",
        "library_items",
        ["is_active"],
        unique=False,
    )
    op.create_index(
        "ix_library_items_source_order_id",
        "library_items",
        ["source_order_id"],
        unique=False,
    )
    op.create_index(
        "ix_library_items_created_at",
        "library_items",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Drop library_items table."""

    op.drop_index(
        "ix_library_items_created_at",
        table_name="library_items",
    )
    op.drop_index(
        "ix_library_items_source_order_id",
        table_name="library_items",
    )
    op.drop_index(
        "ix_library_items_is_active",
        table_name="library_items",
    )
    op.drop_index(
        "ix_library_items_story_id",
        table_name="library_items",
    )
    op.drop_index(
        "ix_library_items_user_id",
        table_name="library_items",
    )
    op.drop_index(
        "ix_library_items_id",
        table_name="library_items",
    )
    op.drop_table("library_items")

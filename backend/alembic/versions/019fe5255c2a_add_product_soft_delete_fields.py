"""add product soft delete fields

Revision ID: 019fe5255c2a
Revises: 414c03e6d067
Create Date: 2026-09-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "019fe5255c2a"
down_revision: Union[str, Sequence[str], None] = "414c03e6d067"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "products",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_products_is_deleted",
        "products",
        ["is_deleted"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_products_is_deleted", table_name="products")
    op.drop_column("products", "deleted_at")
    op.drop_column("products", "is_deleted")

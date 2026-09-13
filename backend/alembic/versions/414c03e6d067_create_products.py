"""create products

Revision ID: 414c03e6d067
Revises: 36905db931d2
Create Date: 2026-09-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "414c03e6d067"
down_revision: Union[str, Sequence[str], None] = "36905db931d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "price",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default=sa.text("0.00"),
        ),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
            server_default=sa.text("'INR'"),
        ),
        sa.Column(
            "product_type",
            sa.String(length=50),
            nullable=False,
            server_default=sa.text("'digital'"),
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
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
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_index(
        "ix_products_id",
        "products",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_products_created_at",
        "products",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_products_slug",
        "products",
        ["slug"],
        unique=True,
    )
    op.create_index(
        "ix_products_is_active",
        "products",
        ["is_active"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_products_is_active", table_name="products")
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_index("ix_products_created_at", table_name="products")
    op.drop_index("ix_products_id", table_name="products")
    op.drop_table("products")

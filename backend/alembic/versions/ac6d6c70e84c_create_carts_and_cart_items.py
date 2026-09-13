"""create carts and cart items

Revision ID: ac6d6c70e84c
Revises: 019fe5255c2a
Create Date: 2026-09-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ac6d6c70e84c"
down_revision: Union[str, Sequence[str], None] = "019fe5255c2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "carts",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'active'"),
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
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_carts_id",
        "carts",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_carts_user_id",
        "carts",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_carts_status",
        "carts",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_carts_created_at",
        "carts",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_carts_is_deleted",
        "carts",
        ["is_deleted"],
        unique=False,
    )

    op.create_table(
        "cart_items",
        sa.Column("cart_id", sa.String(length=36), nullable=False),
        sa.Column("product_id", sa.String(length=36), nullable=False),
        sa.Column(
            "quantity",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("1"),
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
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["cart_id"],
            ["carts.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "cart_id",
            "product_id",
            name="uq_cart_items_cart_product",
        ),
    )

    op.create_index(
        "ix_cart_items_id",
        "cart_items",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_cart_items_cart_id",
        "cart_items",
        ["cart_id"],
        unique=False,
    )
    op.create_index(
        "ix_cart_items_product_id",
        "cart_items",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        "ix_cart_items_created_at",
        "cart_items",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_cart_items_is_deleted",
        "cart_items",
        ["is_deleted"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_cart_items_is_deleted",
        table_name="cart_items",
    )
    op.drop_index(
        "ix_cart_items_created_at",
        table_name="cart_items",
    )
    op.drop_index(
        "ix_cart_items_product_id",
        table_name="cart_items",
    )
    op.drop_index(
        "ix_cart_items_cart_id",
        table_name="cart_items",
    )
    op.drop_index(
        "ix_cart_items_id",
        table_name="cart_items",
    )
    op.drop_table("cart_items")

    op.drop_index(
        "ix_carts_is_deleted",
        table_name="carts",
    )
    op.drop_index(
        "ix_carts_created_at",
        table_name="carts",
    )
    op.drop_index(
        "ix_carts_status",
        table_name="carts",
    )
    op.drop_index(
        "ix_carts_user_id",
        table_name="carts",
    )
    op.drop_index(
        "ix_carts_id",
        table_name="carts",
    )
    op.drop_table("carts")

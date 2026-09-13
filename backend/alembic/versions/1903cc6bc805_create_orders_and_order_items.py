"""create orders and order items

Revision ID: 1903cc6bc805
Revises: ac6d6c70e84c
Create Date: 2026-09-13 15:56:29.383051

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1903cc6bc805"
down_revision: Union[str, Sequence[str], None] = "ac6d6c70e84c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create orders and order_items tables."""

    op.create_table(
        "orders",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column(
            "subtotal",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0.00",
        ),
        sa.Column(
            "total",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0.00",
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
            server_default=sa.false(),
        ),
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_orders_id",
        "orders",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_orders_user_id",
        "orders",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_orders_status",
        "orders",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_orders_created_at",
        "orders",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_orders_is_deleted",
        "orders",
        ["is_deleted"],
        unique=False,
    )

    op.create_table(
        "order_items",
        sa.Column(
            "order_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "product_name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "unit_price",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
        ),
        sa.Column(
            "quantity",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "line_total",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
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
            server_default=sa.false(),
        ),
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "order_id",
            "product_id",
            name="uq_order_items_order_product",
        ),
    )

    op.create_index(
        "ix_order_items_id",
        "order_items",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_order_items_order_id",
        "order_items",
        ["order_id"],
        unique=False,
    )
    op.create_index(
        "ix_order_items_product_id",
        "order_items",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        "ix_order_items_created_at",
        "order_items",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        "ix_order_items_is_deleted",
        "order_items",
        ["is_deleted"],
        unique=False,
    )


def downgrade() -> None:
    """Drop order_items and orders tables."""

    op.drop_index(
        "ix_order_items_is_deleted",
        table_name="order_items",
    )
    op.drop_index(
        "ix_order_items_created_at",
        table_name="order_items",
    )
    op.drop_index(
        "ix_order_items_product_id",
        table_name="order_items",
    )
    op.drop_index(
        "ix_order_items_order_id",
        table_name="order_items",
    )
    op.drop_index(
        "ix_order_items_id",
        table_name="order_items",
    )
    op.drop_table("order_items")

    op.drop_index(
        "ix_orders_is_deleted",
        table_name="orders",
    )
    op.drop_index(
        "ix_orders_created_at",
        table_name="orders",
    )
    op.drop_index(
        "ix_orders_status",
        table_name="orders",
    )
    op.drop_index(
        "ix_orders_user_id",
        table_name="orders",
    )
    op.drop_index(
        "ix_orders_id",
        table_name="orders",
    )
    op.drop_table("orders")

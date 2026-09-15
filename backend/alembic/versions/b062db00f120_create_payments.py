"""create payments

Revision ID: b062db00f120
Revises: 4e75510659be
Create Date: 2026-09-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b062db00f120"
down_revision: Union[str, Sequence[str], None] = "4e75510659be"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create payments table."""

    op.create_table(
        "payments",
        sa.Column(
            "order_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "stage_1_status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "stage_2_status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "stage_3_status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "amount",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0.00",
        ),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
        ),
        sa.Column(
            "provider_reference",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),
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
            ["order_id"],
            ["orders.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "order_id",
            name="uq_payments_order_id",
        ),
    )

    op.create_index(
        "ix_payments_id",
        "payments",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_payments_order_id",
        "payments",
        ["order_id"],
        unique=False,
    )
    op.create_index(
        "ix_payments_status",
        "payments",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_payments_provider_reference",
        "payments",
        ["provider_reference"],
        unique=False,
    )
    op.create_index(
        "ix_payments_created_at",
        "payments",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Drop payments table."""

    op.drop_index(
        "ix_payments_created_at",
        table_name="payments",
    )
    op.drop_index(
        "ix_payments_provider_reference",
        table_name="payments",
    )
    op.drop_index(
        "ix_payments_status",
        table_name="payments",
    )
    op.drop_index(
        "ix_payments_order_id",
        table_name="payments",
    )
    op.drop_index(
        "ix_payments_id",
        table_name="payments",
    )
    op.drop_table("payments")

"""merge multiple head revisions

Revision ID: c5ee0dfdaaf4
Revises: 6fa8abcb5189, de5f9c85e5e5
Create Date: 2024-11-21 20:33:52.844183+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c5ee0dfdaaf4'
down_revision: Union[str, None] = ('6fa8abcb5189', 'de5f9c85e5e5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

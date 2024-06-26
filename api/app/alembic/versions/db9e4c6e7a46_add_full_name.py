"""add full_name

Revision ID: db9e4c6e7a46
Revises: 18b188faa26e
Create Date: 2024-06-19 17:21:53.858636+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'db9e4c6e7a46'
down_revision: Union[str, None] = '18b188faa26e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

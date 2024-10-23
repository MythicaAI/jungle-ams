"""empty message

Revision ID: 3c8b04c8e71c
Revises: 56991ef36cf7, 984caff4b6ea
Create Date: 2024-10-23 14:26:25.320270+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3c8b04c8e71c'
down_revision: Union[str, None] = ('56991ef36cf7', '984caff4b6ea')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

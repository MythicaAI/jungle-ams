"""empty message

Revision ID: e7d827337f91
Revises: 880af339c27c, 938cc290117f
Create Date: 2024-10-17 11:15:39.830521+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'e7d827337f91'
down_revision: Union[str, None] = ('880af339c27c', '938cc290117f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

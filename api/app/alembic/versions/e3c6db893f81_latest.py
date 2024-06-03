"""latest

Revision ID: e3c6db893f81
Revises: 440bbff8d557
Create Date: 2024-06-03 15:47:31.325018+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3c6db893f81'
down_revision: Union[str, None] = '440bbff8d557'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

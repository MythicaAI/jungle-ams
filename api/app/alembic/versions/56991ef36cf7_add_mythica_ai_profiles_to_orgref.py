"""Add Mythica.ai profiles to OrgRef

Revision ID: 56991ef36cf7
Revises: ab1147c07597
Create Date: 2024-10-22 11:18:20.726246+00:00

"""

import logging
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = '56991ef36cf7'
down_revision: Union[str, None] = 'ab1147c07597'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

log = logging.getLogger(__name__)


def upgrade():
    pass


def downgrade():
    pass

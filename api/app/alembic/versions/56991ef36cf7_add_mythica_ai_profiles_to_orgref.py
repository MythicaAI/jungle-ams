"""Add Mythica.ai profiles to OrgRef

Revision ID: 56991ef36cf7
Revises: ab1147c07597
Create Date: 2024-10-22 11:18:20.726246+00:00

"""

from typing import Sequence, Union
import logging

from alembic import op
import sqlmodel
from sqlalchemy import select
from sqlmodel import Session

from db.schema.profiles import Profile, OrgRef
from auth.data import create_new_org_ref_to_profile_roles, get_or_create_org


# revision identifiers, used by Alembic.
revision: str = '56991ef36cf7'
down_revision: Union[str, None] = 'ab1147c07597'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

log = logging.getLogger(__name__)


def upgrade():
    bind = op.get_bind()
    session = Session(bind)
    org_name = "mythica"

    profiles_with_domain = session.execute(
        select(Profile).where(Profile.email.like('%@mythica.ai')).where(
            Profile.email_validate_state == 2
        )
    ).scalars().all()
    if profiles_with_domain:
        create_new_org_ref_to_profile_roles(session, "mythica", profiles_with_domain, "mythica-tags")
        log.warning("Created a new mythica-tags role profile_seq: %s", profiles_with_domain[0].profile_seq)


def downgrade():
    pass

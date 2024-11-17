"""fixup asset version json

Revision ID: 6fa8abcb5189
Revises: 59a02ca9a963
Create Date: 2024-11-17 04:34:44.776788+00:00

"""
import json
from typing import Sequence, Union

from alembic import op
from sqlmodel import Session, select, update

from db.schema.assets import AssetVersion

# revision identifiers, used by Alembic.
revision: str = '6fa8abcb5189'
down_revision: Union[str, None] = '59a02ca9a963'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    AssetVersion contents were erroneously encoded in the database in various formats
    that are all technical valid JSON but have different implementation details for the
    reader when going to a well-defined object. This upgrade moves all content into a
    standardized format which is a canonical JSON document. It cannot be undone.
    """
    bind = op.get_bind()
    session = Session(bind)

    asset_versions = session.exec(select(AssetVersion)).all()
    for av in asset_versions:
        contents = av.contents
        if contents is None:
            continue
        if type(contents) == str:
            contents = json.loads(contents)
        fixed_contents = dict()
        for key, value in contents.items():
            if type(value) == str:
                l = json.loads(value)
                fixed_contents[key] = l
            else:
                fixed_contents[key] = value
        session.exec(
            update(AssetVersion)
            .values(contents=fixed_contents)
            .where(AssetVersion.asset_seq == av.asset_seq)
            .where(AssetVersion.major == av.major)
            .where(AssetVersion.minor == av.minor)
            .where(AssetVersion.patch == av.patch))
        session.commit()


def downgrade() -> None:
    pass

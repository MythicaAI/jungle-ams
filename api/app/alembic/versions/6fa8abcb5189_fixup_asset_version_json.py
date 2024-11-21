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
    contents_as_string = 0
    contents_with_string_lists = 0
    contents_list_converted = 0
    contents_list_items_converted = 0
    for av in asset_versions:
        contents = av.contents
        if contents is None:
            continue
        if type(contents) == str:
            print(f"converting {contents}")
            contents = json.loads(contents)
            contents_as_string += 1
        fixed_contents = dict()
        did_convert = False
        for key, value in contents.items():
            # links are intended to be strings
            if key == 'links':
                continue
            if type(value) == str:
                # content item was encoded as string
                print(f"converting {value}")
                l = json.loads(value)
                fixed_contents[key] = l
                contents_list_converted += 1
                did_convert = True
            elif type(value) == dict:
                fixed_list = [value]
                fixed_contents[key] = fixed_list
            elif type(value) == list:
                fixed_list = []
                for item in value:
                    if type(item) == str:
                        # item was encoded as string
                        print(f"converting {item}")
                        fixed_list.append(json.loads(item))
                        did_convert = True
                        contents_list_items_converted += 1
                    else:
                        fixed_list = item
                fixed_contents[key] = fixed_list
            else:
                fixed_contents[key] = value
        if did_convert:
            contents_with_string_lists += 1
        session.exec(
            update(AssetVersion)
            .values(contents=fixed_contents)
            .where(AssetVersion.asset_seq == av.asset_seq)
            .where(AssetVersion.major == av.major)
            .where(AssetVersion.minor == av.minor)
            .where(AssetVersion.patch == av.patch))
        session.commit()
    print(f"fixed-up")
    print(f"  contents converted: {contents_as_string}")
    print(f"  contents with converted lists: {contents_with_string_lists}")
    print(f"  contents list converted: {contents_list_converted}")
    print(f"  contents list items converted: {contents_list_items_converted}")


def downgrade() -> None:
    pass

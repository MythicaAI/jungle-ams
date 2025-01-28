"""Fix link table index

Revision ID: 23ee0bbb9213
Revises: 78c9325f2e68
Create Date: 2025-01-28 21:40:08.675819+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '23ee0bbb9213'
down_revision: Union[str, None] = '78c9325f2e68'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('asset_version_entry_points')

    op.create_table('asset_version_entry_points',
    sa.Column('asset_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=False),
    sa.Column('major', sa.Integer(), nullable=False),
    sa.Column('minor', sa.Integer(), nullable=False),
    sa.Column('patch', sa.Integer(), nullable=False),
    sa.Column('src_file_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=True),
    sa.Column('entry_point', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('job_def_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=True),
    sa.ForeignKeyConstraint(['job_def_seq'], ['job_defs.job_def_seq'], ),
    sa.ForeignKeyConstraint(['src_file_seq'], ['files.file_seq'], ),
    sa.PrimaryKeyConstraint('asset_seq', 'major', 'minor', 'patch', 'src_file_seq', 'entry_point')
    )


def downgrade() -> None:
    op.drop_table('asset_version_entry_points')

    # old table version
    op.create_table('asset_version_entry_points',
    sa.Column('asset_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=False),
    sa.Column('major', sa.Integer(), nullable=False),
    sa.Column('minor', sa.Integer(), nullable=False),
    sa.Column('patch', sa.Integer(), nullable=False),
    sa.Column('src_file_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=True),
    sa.Column('entry_point', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('job_def_seq', sa.BigInteger().with_variant(sa.Integer(), 'sqlite'), nullable=True),
    sa.ForeignKeyConstraint(['job_def_seq'], ['job_defs.job_def_seq'], ),
    sa.ForeignKeyConstraint(['src_file_seq'], ['files.file_seq'], ),
    sa.PrimaryKeyConstraint('asset_seq', 'major', 'minor', 'patch')
    )


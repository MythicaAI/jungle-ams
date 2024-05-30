"""initial tables

Revision ID: 440bbff8d557
Revises: 
Create Date: 2024-04-19 15:01:13.930725+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '440bbff8d557'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the uploads table
    op.create_table(
        'uploads',
        sa.Column('id', sa.Integer,
                  primary_key=True),
        sa.Column('uploaded_by', sa.String(length=255),
                  nullable=False),
        sa.Column('bucket_name', sa.String(32),
                  nullable=False),
        sa.Column('object_name', sa.String(255),
                  nullable=False),
        sa.Column('file_name', sa.String(255),
                  nullable=False),
        sa.Column('content_hash', sa.String(255),
                  nullable=False),
        sa.Column('size', sa.Integer,
                  nullable=False),
        sa.Column('file_type', sa.String(16),
                  nullable=False),
        sa.Column('created_at', sa.DateTime,
                  nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime,
                  nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('status',
                  sa.Enum(
                      'upload_started',
                      'upload_completed',
                      'pipeline_started',
                      'pipeline_completed',
                      name='upload_status'),
                  nullable=False)
    )

    # Create the pipeline_events table
    op.create_table(
        'pipeline_events',
        sa.Column('id', sa.Integer,
                  primary_key=True),
        sa.Column('upload_id', sa.Integer,
                  nullable=False),
        sa.Column('event_type', sa.String(50),
                  nullable=False),
        sa.Column('payload', postgresql.JSONB,
                  nullable=False),
        sa.Column('created_at', sa.DateTime,
                  nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('processed_at', sa.DateTime)
    )


def downgrade() -> None:
    pass

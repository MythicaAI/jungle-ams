"""add_notify_table_change_function_and_trigger

Revision ID: c60e6e8be8e6
Revises: 48f4e15118ea
Create Date: 2024-09-23 11:05:54.108100+00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c60e6e8be8e6'
down_revision: Union[str, None] = '48f4e15118ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the notify_table_change function
    op.execute(
        """
    CREATE OR REPLACE FUNCTION notify_table_change()
    RETURNS TRIGGER AS $$
    BEGIN
      PERFORM pg_notify('table_change', row_to_json(NEW)::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """
    )

    # Create the table_change_trigger
    op.execute("""DROP TRIGGER IF EXISTS table_change_trigger ON public.events;""")
    op.execute(
        """
    CREATE TRIGGER table_change_trigger
    AFTER INSERT OR UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION notify_table_change();
    """
    )


def downgrade() -> None:
    op.execute(
        """
    DROP TRIGGER IF EXISTS table_change_trigger ON public.events;
    """
    )

    # Drop the function
    op.execute(
        """
    DROP FUNCTION IF EXISTS notify_table_change();
    """
    )

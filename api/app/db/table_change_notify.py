import json
import logging
from typing import Type

from psycopg2 import connect
from sqlmodel import SQLModel

from config import app_config
from db.schema.events import Event
from db.schema.jobs import Job, JobResult

log = logging.getLogger(__name__)


async def listen_for_notifications(sql_url, channels: list[str]):
    """Listens for PostgreSQL NOTIFY events and broadcasts to WebSocket clients."""

    # create a new async connection for the notifications
    conn = connect(sql_url, autocommit=True)
    for channel in channels:
        conn.execute(f"LISTEN {channel};")
        log.info("listening on db channel: %s", channel)

    async for notify in await conn.notifies.get():
        if notify:
            payload = json.loads(notify.payload)  # Decode the JSON payload
            log.info("received notification: %s", payload)


def generate_trigger_function(model: Type[SQLModel], trigger_name: str, channel: str):
    """
    Generates a PostgresSQL trigger function that sends the entire row as JSON via NOTIFY.
    """
    table_name = model.__tablename__  # Get table name from SQLModel class
    column_names = [field for field in model.__annotations__.keys()]  # Extract column names
    json_build_object = ", ".join(
        [f"'{col}', NEW.{col}" for col in column_names])  # Convert to json_build_object format

    function_sql = f"""
    CREATE OR REPLACE FUNCTION {trigger_name}() RETURNS TRIGGER AS $$
    BEGIN
        PERFORM pg_notify('{channel}', json_build_object({json_build_object})::TEXT);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    trigger_sql = f"""
    DROP TRIGGER IF EXISTS {trigger_name}_trigger ON {table_name};

    CREATE TRIGGER {trigger_name}_trigger
    AFTER INSERT ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION {trigger_name}();
    """

    return function_sql, trigger_sql


async def register_table_change_notification():
    """Start listening for database changes on FastAPI startup."""
    generate_trigger_function(Event, 'trigger_event_insert', 'events')
    generate_trigger_function(Job, 'trigger_job_insert', 'jobs')
    generate_trigger_function(JobResult, 'trigger_job_result_insert', 'job_results')
    import asyncio
    asyncio.create_task(listen_for_notifications(app_config().sql_url, ['events', 'jobs', 'job_results']))

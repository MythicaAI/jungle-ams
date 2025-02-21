import asyncio
import logging
from typing import Type

from fastapi import FastAPI
from sqlmodel import SQLModel

from db.connection import db_session_pool
from db.schema.events import Event
from db.schema.jobs import Job, JobResult

log = logging.getLogger(__name__)


async def listen_for_notifications(app: FastAPI, channels):
    """Listens for PostgreSQL NOTIFY events and broadcasts to WebSocket clients."""
    # create a new async connection for the notifications
    async with db_session_pool(app) as db_session:
        engine = db_session.get_bind()
        if engine.dialect.name != "postgresql":
            log.warning("table change notifications only supported for postgresql currently")
            return

        # drop down to the native connection to access the async notification queue
        conn = await db_session.connection()
        raw_conn = await conn.get_raw_connection()
        asyncpg_conn = raw_conn.driver_connection

        for channel_name, data in channels.items():
            sql_type, fn = data
            trigger_name = f"trigger_{channel_name}"
            func_sql, trigger_sql = generate_trigger_function(sql_type, trigger_name, channel_name)

            await asyncpg_conn.execute(func_sql)
            await asyncpg_conn.execute(trigger_sql)
            await asyncpg_conn.execute(f"LISTEN {channel_name};")
            log.info("listening on db channel: %s", channel_name)
            await asyncpg_conn.add_listener(channel_name, fn)


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


async def handle_event_notifications(connection, pid, channel, payload):
    log.info("NOTIFY events, connection: %s, pid: %s, channel: %s, payload: %s",
             connection, pid, channel, payload)


async def handle_job_notifications(connection, pid, channel, payload):
    log.info("NOTIFY jobs, connection: %s, pid: %s, channel: %s, payload: %s",
             connection, pid, channel, payload)


async def handle_job_results_notifications(connection, pid, channel, payload):
    log.info("NOTIFY job_results, connection: %s, pid: %s, channel: %s, payload: %s",
             connection, pid, channel, payload)


async def register_table_change_notification(app):
    """Start listening for database changes on FastAPI startup."""

    # mapping from table name to handler
    channels = {
        'events': (Event, handle_event_notifications),
        'jobs': (Job, handle_job_notifications),
        'job_results': (JobResult, handle_job_results_notifications),
    }

    asyncio.create_task(listen_for_notifications(app, channels))

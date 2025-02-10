from sqlmodel import SQLModel
from typing import Type

from db.schema.events import Event
from db.schema.jobs import Job, JobResult


def generate_trigger_function(model: Type[SQLModel], trigger_name: str, channel: str):
    """
    Generates a PostgreSQL trigger function that sends the entire row as JSON via NOTIFY.
    """
    table_name = model.__tablename__  # Get table name from SQLModel class
    column_names = [field.name for field in model.__annotations__.keys()]  # Extract column names
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


def register_table_monitors():
    generate_trigger_function(Event, 'trigger_event_insert', 'events')
    generate_trigger_function(Job, 'trigger_job_insert', 'jobs')
    generate_trigger_function(JobResult, 'trigger_job_result_insert', 'job_results')

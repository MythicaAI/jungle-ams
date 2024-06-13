# from https://gist.github.com/mackross/a49b72ad8d24f7cefc32
# https://stackoverflow.com/questions/6507475/job-queue-as-sql-table-with-multiple-consumers-postgresql
import asyncio
from uuid import UUID
from typing_extensions import Self

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

pgsql_dequeue = """
update 
    events
set 
    acked = current_timestamp
where
    id in (
        select
            id
        from
            events
        where
            acked is null
        order by 
            queued
        limit 1 for update
    )
    returning id, job_data as result;"""

pgsql_complete = """
update
    events
set completed = current_timestamp
where id = :event_id
"""


class EventsSession(object):
    """
    Worker provides context wrapper around SQL connection and async
    accessors of the event queue.
    """

    def __init__(self, sql_url, sleep_interval, echo=False):
        self.async_engine = create_async_engine(sql_url, echo=echo)
        self.sleep_interval = sleep_interval
        self.conn = None

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.async_engine.dispose()
        if self.conn:
            self.conn.close()

    async def ack_next(self):
        """Asynchronously yield event data from the events table."""
        while True:
            stmt = text(pgsql_dequeue)
            async with self.async_engine.begin() as conn:
                result = await conn.execute(stmt)
                data = result.fetchone()
            if data is None:
                await asyncio.sleep(self.sleep_interval)
                continue
            yield data[0], data[1]

    async def complete(self, event_id: UUID):
        """Asynchronously acknowledge an event."""
        stmt = text(pgsql_complete)
        async with self.async_engine.begin() as conn:
            await conn.execute(stmt, {'event_id': event_id})


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    import os
    sql_url = os.environ.get('SQL_URL', 'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 1)
    with EventsSession(sql_url, sleep_interval) as session:
        async for event_id, json_data in session.ack_next():
            await session.complete(event_id)
            print(event_id, json_data)


if __name__ == '__main__':
    asyncio.run(main())

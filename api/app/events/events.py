# from https://gist.github.com/mackross/a49b72ad8d24f7cefc32
# https://stackoverflow.com/questions/6507475/job-queue-as-sql-table-with-multiple-consumers-postgresql
import asyncio
from typing import Any, AsyncGenerator, Self
from uuid import UUID

from sqlalchemy import Engine, text, create_engine, CursorResult

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_scoped_session
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import asyncio

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


class Worker(object):
    """
    Worker provides context wrapper around SQL connection and async
    accessors of the event queue.
    """

    def __init__(self, engine, sleep_interval):
        self.engine = engine
        self.sleep_interval = sleep_interval
        self.conn = None

    def __enter__(self) -> Self:
        self.conn = self.engine.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()

    async def ack(self):
        """Asynchronously yield event data from the events table."""
        while True:
            stmt = text(pgsql_dequeue)
            self.conn.begin()
            result = self.conn.execute(stmt)
            self.conn.commit()
            data = result.fetchone()
            if data is None:
                await asyncio.sleep(self.sleep_interval)
                continue
            yield data[0], data[1]

    async def complete(self, event_id: UUID):
        """Asynchronously acknowledge an event."""
        stmt = text(pgsql_complete)
        self.conn.begin()
        self.conn.execute(stmt, {'event_id': event_id})
        self.conn.commit()


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    import os
    sql_url = os.environ.get('SQL_URL', 'postgresql://test:test@localhost:5432/upload_pipeline')
    engine = create_engine(sql_url)
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 1)
    with Worker(engine, sleep_interval) as worker:
        async for event_id, json_data in worker.ack():
            await worker.complete(event_id)
            print(event_id, json_data)


if __name__ == '__main__':
    import asyncio

    asyncio.run(main())

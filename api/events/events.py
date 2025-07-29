# from https://gist.github.com/mackross/a49b72ad8d24f7cefc32
# https://stackoverflow.com/questions/6507475/job-queue-as-sql-table-with-multiple-consumers-postgresql
import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from typing_extensions import Self

pgsql_dequeue = """
update 
    events
set 
    acked = current_timestamp
where
    event_seq in (
        select
            event_seq
        from
            events
        where
            acked is null
            and
            ({event_type_condition})
        order by 
            queued
        limit 1 for update
    )
    returning event_seq, event_type, job_data as result;"""

pgsql_complete = """
update
    events
set completed = current_timestamp
where event_seq = :event_seq
"""


class EventsSession(object):
    """
    Worker provides context wrapper around SQL connection and async
    accessors of the event queue.
    """

    def __init__(self, sql_url, sleep_interval, event_type_prefixes, echo=False):
        self.async_engine = create_async_engine(sql_url, echo=echo)
        self.sleep_interval = sleep_interval
        self.conn = None
        self.event_type_condition = " or ".join([f"event_type like '{prefix}%%'" for prefix in event_type_prefixes]) or "TRUE"

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.async_engine.dispose()
        if self.conn:
            self.conn.close()

    async def ack_next(self):
        """Asynchronously yield event data from the events table."""
        while True:
            stmt = text(pgsql_dequeue.format(
                event_type_condition=self.event_type_condition))
            async with self.async_engine.begin() as conn:
                result = await conn.execute(stmt)
                data = result.fetchone()
            if data is None:
                await asyncio.sleep(self.sleep_interval)
                continue
            yield data[0], data[1], data[2]

    async def complete(self, event_seq: int):
        """Asynchronously acknowledge an event."""
        stmt = text(pgsql_complete)
        async with self.async_engine.begin() as conn:
            await conn.execute(stmt, {"event_seq": event_seq})


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    import os
    sql_url = os.environ.get("SQL_URL", "postgresql+asyncpg://test:test@localhost:5432/upload_pipeline")
    sleep_interval = os.environ.get("SLEEP_INTERVAL", 1)
    async with EventsSession(sql_url, sleep_interval, event_type_prefixes=[]) as session:
        async for event_seq, event_type, json_data in session.ack_next():
            await session.complete(event_seq)
            print(event_seq, event_type, json_data)


if __name__ == "__main__":
    asyncio.run(main())

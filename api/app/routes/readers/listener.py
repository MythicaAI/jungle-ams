import json
import asyncio
import asyncpg
import logging

from config import app_config
from routes.readers.readers import reader_connection_manager


engine_url = app_config().sql_url.strip()
log = logging.getLogger(__name__)
log.info("Listener: %s", 'data')


class Listener:

    async def listen_for_changes(self):
        conn = await asyncpg.connect(engine_url)
        await conn.add_listener('table_change', self._listener)
        try:
            while True:
                await asyncio.sleep(0.1)  # Keeps the connection alive
        finally:
            await conn.close()

    async def _listener(self, conn, pid, channel, payload):
        data = json.loads(payload)
        log.info("Listener captured event data: %s, conn: %s, pid: %s, channel: %s", data, conn, pid, channel)
        await reader_connection_manager.execute_all_profile_processors(data)

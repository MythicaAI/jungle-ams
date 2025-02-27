import asyncio
from typing import Awaitable, Set
from uuid import UUID, uuid4

from decoder_combiner import StreamContext
from encoder_cbor import Encoder
from files import Cache
from net_buffer import NetBuffer
from server.process_context import ProcessContext
from server.server import Server


class Client:
    """Client state context"""

    def __init__(self, server: Server):
        self._uuid: UUID = uuid4()
        self.tasks: Set[asyncio.Task] = set()
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.stream = StreamContext()
        self.server = server
        self.files = Cache(server.files.base_path / str(self._uuid), parent=server.files)
        self.stack: list[ProcessContext] = []
        self.encoder = Encoder()
        self.flow = 0
        self.last_time_ms = 0
        self._stopped = False
        self._stop_event = asyncio.Event()

    @property
    def stopped(self) -> bool:
        """Check if this client is stopped."""
        return self._stopped

    @property
    def unique_id(self) -> UUID:
        """
        Get the unique ID of the client
        """
        return self._uuid

    def authorize(self, auth_token):
        pass

    def add_task(self, coro: Awaitable) -> asyncio.Task:
        """Add a new background task to this client.

        The task will be automatically canceled when the client disconnects.
        """
        if self._stopped:
            raise RuntimeError("Cannot add task to stopped client")

        task = asyncio.create_task(self._task_wrapper(coro))
        self.tasks.add(task)
        return task

    async def _task_wrapper(self, coro: Awaitable):
        """Wrapper for background tasks to handle cleanup."""
        try:
            return await coro
        except asyncio.CancelledError:
            # Expected during shutdown
            raise
        except Exception as e:
            print(f"Task for client {self.client_id} failed: {e}")
        finally:
            # Self-cleanup when task completes
            if self.tasks and asyncio.current_task() in self.tasks:
                self.tasks.remove(asyncio.current_task())

    @property
    def stopped(self):
        """Check if this client is stopped."""
        return self._stopped

    async def stop(self):
        """Close the client connection and cancel all tasks."""
        if self._stopped:
            return

        self._stopped = True
        self._stop_event.set()

        # Cancel all background tasks
        for task in self.tasks:
            if not task.done():
                task.cancel()

        # Wait for all tasks to complete/cancel
        if self.tasks:
            await asyncio.gather(*self.tasks, return_exceptions=True)

        self.tasks.clear()

    async def wait_stop_requested(self):
        """Wait for this client to be stopped, for tasks that need a stop signal."""
        await self._stop_event.wait()

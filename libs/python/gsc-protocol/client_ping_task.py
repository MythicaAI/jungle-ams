import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from httpx_ws import AsyncWebSocketSession, WebSocketDisconnect

logger = logging.getLogger(__name__)


class PingTask:
    def __init__(
            self,
            base_interval: float = 1.0,
            max_interval: float = 32.0,
            timeout: float = 5.0,
            max_failures: int = 3
    ):
        self.base_interval = base_interval
        self.max_interval = max_interval
        self.timeout = timeout
        self.max_failures = max_failures
        self.current_interval = base_interval
        self.consecutive_failures = 0
        self._stop_event = asyncio.Event()

    def now(self) -> datetime:
        return datetime.now(timezone.utc)

    async def stop(self):
        """Signal the ping task to stop gracefully."""
        self._stop_event.set()

    def _increase_backoff(self):
        """Increase the interval exponentially up to max_interval."""
        self.consecutive_failures += 1
        self.current_interval = min(
            self.current_interval * 2,
            self.max_interval
        )

    def _reset_backoff(self):
        """Reset the interval and failure counter after successful ping."""
        self.consecutive_failures = 0
        self.current_interval = self.base_interval

    async def ping_pong_task(self, ws: AsyncWebSocketSession) -> Optional[Exception]:
        """
        Run the ping-pong monitoring task.
        Returns the exception that caused termination, if any.
        """
        try:
            while not self._stop_event.is_set():
                try:
                    ping = encode_ping_pong()  # Assuming this function exists
                    start_time = self.now()

                    await ws.send_bytes(ping)
                    try:
                        await ws.receive_bytes(timeout=self.timeout)
                        elapsed = self.now() - start_time
                        logger.debug(
                            "Ping response received after %s seconds",
                            elapsed.total_seconds()
                        )
                        self._reset_backoff()

                    except TimeoutError:
                        elapsed = self.now() - start_time
                        logger.warning(
                            "Ping timeout after %s seconds",
                            elapsed.total_seconds()
                        )
                        self._increase_backoff()

                        if self.consecutive_failures >= self.max_failures:
                            raise ConnectionError(
                                f"Connection lost after {self.max_failures} failed pings"
                            )

                    await asyncio.sleep(self.current_interval)

                except WebSocketDisconnect as e:
                    logger.error("WebSocket disconnected: %s", str(e))
                    return e

                except Exception as e:
                    logger.exception("Error in ping-pong task")
                    return e

        finally:
            logger.info("Ping-pong task stopped")


async def start_task(ws: AsyncWebSocketSession):
    """Example of how to use the PingTask."""
    task = PingTask()
    task_handle = None

    try:
        # Start the ping task
        task_handle = asyncio.create_task(
            task.ping_pong_task(ws),
            name="ping-pong")
        await task_handle

    finally:
        # Ensure ping task is properly shutdown
        await task.stop()
        if task_handle:
            try:
                await asyncio.wait_for(task_handle, timeout=5.0)
            except asyncio.TimeoutError:
                logger.warning("ping task did not stop gracefully")

import asyncio
import json
import os
import logging
import re
import shlex
from collections import defaultdict
from contextlib import suppress
from datetime import datetime, timedelta

from nats.aio.client import Client as NATS
from nats.aio.msg import Msg

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("lsp-worker")

NATS_URL= os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')
SUBJECT_PATTERN = "lsp.session.>"

SESSION_TIMEOUT_SECS = 300  # auto-shutdown inactive sessions after 5 min


class LspSession:
    def __init__(self, session_id: str, channel_type: str, nats: NATS):
        self.session_id = session_id
        self.channel_type = channel_type
        self.nats = nats
        self.last_activity = datetime.utcnow()

        self.proc = None
        self.stdin = None
        self.stdout = None
        self.task = None

        self.in_subject = f"lsp.session.{channel_type}.{session_id}.in"
        self.out_subject = f"lsp.session.{channel_type}.{session_id}.out"

    async def start(self):
        cmd = "pylsp"
        self.proc = await asyncio.create_subprocess_exec(
            *shlex.split(cmd),
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        self.stdin = self.proc.stdin
        self.stdout = self.proc.stdout
        log.info(f"[{self.session_id}] Started LSP subprocess")

        self.task = asyncio.create_task(self._forward_stdout())

    async def _forward_stdout(self):
        buffer = b""
        content_length = None

        try:
            while True:
                chunk = await self.stdout.read(4096)
                if not chunk:
                    break
                buffer += chunk
                while True:
                    if content_length is None:
                        header_end = buffer.find(b"\r\n\r\n")
                        if header_end == -1:
                            break
                        header = buffer[:header_end].decode()
                        match = re.search(r"Content-Length: (\d+)", header)
                        if not match:
                            log.warning(f"[{self.session_id}] Malformed header: {header}")
                            buffer = buffer[header_end+4:]
                            continue
                        content_length = int(match.group(1))
                        buffer = buffer[header_end+4:]
                    if len(buffer) < content_length:
                        break
                    body = buffer[:content_length]
                    buffer = buffer[content_length:]
                    content_length = None

                    await self.nats.publish(self.out_subject, body)
                    self.last_activity = datetime.utcnow()
        except Exception as e:
            log.error(f"[{self.session_id}] Error reading from LSP: {e}")

    async def handle_incoming(self, msg: Msg):
        if self.stdin is None:
            return
        try:
            data = msg.data
            payload = f"Content-Length: {len(data)}\r\n\r\n".encode() + data
            self.stdin.write(payload)
            await self.stdin.drain()
            self.last_activity = datetime.utcnow()
        except Exception as e:
            log.error(f"[{self.session_id}] Error writing to LSP: {e}")

    async def stop(self):
        log.info(f"[{self.session_id}] Shutting down LSP session")
        if self.proc:
            with suppress(ProcessLookupError):
                self.proc.terminate()
                await self.proc.wait()
        if self.task:
            self.task.cancel()
            with suppress(asyncio.CancelledError):
                await self.task


async def main():
    nc = NATS()
    await nc.connect(servers=[NATS_URL])
    log.info("[NATS] connected")

    sessions: dict[str, LspSession] = {}

    async def message_handler(msg: Msg):
        try:
            subject_parts = msg.subject.split(".")
            if len(subject_parts) != 5:
                log.warning(f"Ignoring malformed subject: {msg.subject}")
                return
            _, _, channel_type, session_id, direction = subject_parts
            session_key = f"{channel_type}:{session_id}"

            if session_key not in sessions:
                session = LspSession(session_id, channel_type, nc)
                await session.start()
                sessions[session_key] = session

            session = sessions[session_key]
            await session.handle_incoming(msg)
        except Exception as e:
            log.error(f"Handler error: {e}")

    await nc.subscribe(SUBJECT_PATTERN, cb=message_handler)

    async def cleanup_loop():
        while True:
            await asyncio.sleep(60)
            now = datetime.utcnow()
            expired = []
            for key, session in sessions.items():
                if now - session.last_activity > timedelta(seconds=SESSION_TIMEOUT_SECS):
                    await session.stop()
                    expired.append(key)
            for key in expired:
                sessions.pop(key, None)

    await cleanup_loop()  # runs forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Shutting down LSP worker.")

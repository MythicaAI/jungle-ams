"""
Initial manual tests for websockets

This manual script allows validate performance, load handling,
real-world behavior.

To run use:
$ cd api/app
$ python ./websocket_script_test.py
"""
# TODO: Make it flexible for different envs: dev, local, etc.
# TODO: Delete even on fails all tested objects

import json
import logging
import multiprocessing
import os

import asyncio
import httpx
from httpx_ws import AsyncWebSocketSession, aconnect_ws

from files_factory import upload_files
from profile_factory import create_profile_and_start_session

log = logging.getLogger(__name__)


class WebSocketTester:
    """
    WebSocket test wrapper
    """

    def __init__(self, websocket_uri, http_uri, num_connections=5):
        self.websocket_uri = websocket_uri
        self.http_uri = http_uri
        self.num_connections = num_connections
        self.profiles_count = num_connections
        self.profiles = {}
        self.timeout = num_connections / 10 if num_connections / 10 > 5 else 5

    async def check_websocket_connection(
            self, websocket: AsyncWebSocketSession, expected_count, page_size
    ):
        """
        Read items from the WebSocket connection and validate the output.
        """
        max_reads = expected_count / page_size
        reads = 0
        page_sized_reads = 0
        count_events = 0

        while reads < max_reads:
            reads += 1
            output_data = await websocket.receive_json()
            assert output_data is not None
            print("Received output_data %s", output_data)
            if len(output_data) == page_size:
                page_sized_reads += 1
            for output_raw in output_data:
                raw: dict = json.loads(output_raw)
                assert 'index' in raw
                assert 'payload' in raw
                # TODO: assert raw["index"] == stream_items[count_events]["index"]
                count_events += 1

        assert page_sized_reads == int(
            expected_count / page_size
        ), "full pages read constraint"
        assert count_events == expected_count, "total events read constraint"

    async def test_websocket(
            self,
            test_profile: ProfileTestObj,
    ):
        auth_header = test_profile.authorization_header()
        generate_event_count = 10

        await upload_files(
            test_profile, self.http_uri, generate_event_count, timeout=self.timeout
        )

        async with httpx.AsyncClient() as client:
            page_size = 3
            await client.post(
                f"{self.http_uri}/readers/",
                json={'source': 'events', 'params': {'page_size': page_size}},
                headers=auth_header,
                timeout=self.timeout,
            )
            print(auth_header)

        async with httpx.AsyncClient() as client:
            async with aconnect_ws(
                    f"{self.websocket_uri}/readers/connect",
                    client,
                    headers=auth_header,
                    timeout=self.timeout,
            ) as websocket:
                await asyncio.sleep(1)

                # Check initial items in connection
                await self.check_websocket_connection(
                    websocket, generate_event_count, page_size
                )

    async def run(self):
        """
        Run the asynchronous method in an asyncio event loop.
        This will be called inside a separate process.
        """
        tasks = []
        for _ in range(self.profiles_count):
            profile_test_obj = await create_profile_and_start_session(
                api_base=self.http_uri,
                timeout=self.timeout,
            )
            self.profiles[profile_test_obj.profile.profile_id] = profile_test_obj
            tasks.append(self.test_websocket(profile_test_obj))

        await asyncio.gather(*tasks)


def run_in_process(websocket_uri: str, http_uri: str, num_connections: int):
    """
    Function to create a WebSocketTester instance and run it in a separate process.
    """
    tester = WebSocketTester(websocket_uri, http_uri, num_connections)
    asyncio.run(tester.run())


from urllib.parse import urlparse, urlunparse


def convert_to_ws(url):
    """Conditionally convert the URL to the websocket version"""
    parsed_url = urlparse(url)
    scheme = 'ws' if parsed_url.scheme == 'http' else 'wss'
    ws_url = parsed_url._replace(scheme=scheme)
    return urlunparse(ws_url)


def main():
    api_base_uri = os.environ.get("API_BASE_URI", "http://localhost:50555/v1")
    num_of_connections = 5

    process = multiprocessing.Process(
        target=run_in_process, args=(
            convert_to_ws(api_base_uri),
            api_base_uri,
            num_of_connections)
    )
    process.start()
    process.join()

    print("All WebSocket testing processes completed.")


if __name__ == "__main__":
    main()


import json
import logging
import os
from typing import Any, Optional

from cryptid import location
import nats
import requests

from ripple.automation.utils import format_exception

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

NATS_URL= os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')

class NatsAdapter():
    def __init__(self, nats_url: str=NATS_URL) -> None:
        self.nats_url = nats_url
        self.listeners = {}
        self.nc = None  # Single NATS client connection
        self.env = os.getenv('MYTHICA_ENVIRONMENT', 'debug')
        self.location = location.location()

    async def _connect(self) -> None:
        """Establish a connection to NATS."""
        if not self.nc:
            log.debug("Connecting to NATS")
            self.nc = await nats.connect(servers=[self.nats_url])
            log.info("Connected to NATS")


    async def _disconnect(self) -> None:
        """Disconnect from NATS gracefully."""
        if self.nc:
            log.debug("Disconnecting from NATS")
            await self.nc.drain()  # Gracefully stop receiving messages
            self.nc = None
            log.info("Disconnected from NATS")

    def _scoped_subject(self, subject: str) -> str:
        """Return a subject that is scoped to the environment and location"""
        return f"{subject}.{self.env}.{self.location}"

    def _scoped_subject_to(self, subject: str, entity: str) -> str:
        """Return a subject that is scoped to a scoped entity"""
        return f"{subject}.{self.env}.{self.location}.{entity}"

    async def _internal_post(self, subject: str, data: dict) -> None:
        await self._connect()
        try:
            await self.nc.publish(subject, json.dumps(data).encode())
            log.info(f"Posted: {subject} - {data}")
        except Exception as e:
            log.error(f"Sending to NATS failed: {subject} - {data} - {format_exception(e)}")
        finally:
            if not self.listeners:
                await self._disconnect()

    async def post(self, subject: str, data: dict) -> None:
        """Post data to NATS on subject. """
        await self._internal_post(self._scoped_subject(subject), data)

    async def post_to(self, subject: str, entity: str, data: dict) -> None:
        await self._internal_post(self._scoped_subject_to(subject, entity), data)

    async def listen(self, subject: str, callback: callable) -> None:
        await self._internal_listen(self._scoped_subject(subject), callback)

    async def listen_as(self, subject: str, entity: str, callback: callable) -> None:
        await self._internal_listen(self._scoped_subject_to(subject, entity), callback)

    async def _internal_listen(self, subject: str, callback: callable):
        if subject in self.listeners:
            log.warning(f"NATS listener already active for subject {subject}")
            return

        """ Listen to NATS """
        await self._connect()

        async def message_handler(msg) -> None:
            try:
                payload = json.loads(msg.data.decode('utf-8'))
                log.info(f"Received message on {subject}: {payload}")
                await callback(payload)
            except Exception as e:
                log.error(f"Error processing message on {subject}: {format_exception(e)}")

        try:
            # Wait for the response with a timeout (customize as necessary)
            log.debug("Setting up NATS response listener")
            listener = await self.nc.subscribe(subject, queue="worker", cb=message_handler)
            self.listeners[subject] = listener
            log.info(f"NATS subscribed to {subject}")

        except Exception as e:
            log.error(f"Error setting up listener for subject {subject}: {format_exception(e)}")
            raise e

    async def unlisten(self, subject: str) -> None:

        """Shut down the listener for a specific subject."""
        if subject in self.listeners:
            log.debug(f"Shutting down listener for subject {subject}")
            subscription = self.listeners.pop(subject)
            await subscription.unsubscribe()
            log.info(f"Listener for subject {subject} shut down")
            if not self.listeners:
                await self._disconnect()
                log.info(f"Last Listener was shut down. Closing Connection")
        else:
            log.warning(f"No active listener found for subject {subject}")


class RestAdapter():
    
    def get(self, endpoint: str, data: dict={}, token: str = None) -> Optional[str]:
        """Get data from an endpoint."""
        log.debug(f"Getting from Endpoint: {endpoint} - {data}" )
        response = requests.get(
            endpoint,
            headers={
                "Authorization": "Bearer %s" % token
            }
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {data} - {response.status_code}")
            return None

    def post(self, endpoint: str, json_data: Any, token: str) -> Optional[str]:
        """Post data to an endpoint synchronously. """
        log.debug(f"posting[{endpoint}]: {json_data}" )
        response = requests.post(
            endpoint, 
            json=json_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer %s" % token
            }
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {json_data} - {response.status_code}")
            return None

    def post_file(self, endpoint: str, file_data: list, token: str) -> Optional[str]:
        """Post file to an endpoint."""
        log.debug(f"Sending file to Endpoint: {endpoint} - {file_data}" )
        response = requests.post(
            endpoint, 
            files=file_data, 
            headers={"Authorization": "Bearer %s" % token}
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {file_data} - {response.status_code}")
            return None

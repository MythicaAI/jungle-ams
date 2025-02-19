import asyncio
from asyncio import Task
from logging import Logger
import traceback
import os
from cryptid import location
import nats
import uuid
import json


import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

def format_exception(e: Exception) -> str:
    return f" {str(e)}\n{traceback.format_exc()}"

def error_handler(log: Logger) -> callable:
    def handler(task: Task):
        e = task.exception()
        if e:
            log.error(f"Error publishing result: {format_exception(e)}")
    return handler



NATS_URL = os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')
NATS_RESULT_SUBJECT = os.environ.get('NATS_RESULT_SUBJECT', 'result')
ENVIRONMENT = os.getenv('MYTHICA_ENVIRONMENT', 'debug')
LOCATION = location.location()
PROCESS_GUID = str(uuid.uuid4())

def nats_submit(channel: str, path: str, data: dict, correlation: str, auth_token: str) -> list[dict]:
    return asyncio.run(
        __nats_submit(channel, path, data, correlation, auth_token)
    )

async def __nats_submit(channel: str, path: str, data: dict, correlation: str, auth_token: str) -> list[dict]:
    """Submit work to NATS.
    
    Args:
        channel: NATS channel to submit to
        path: Automation path
        data: Request data
        correlation: Work identifier
        auth_token: Authorization token
        
    Returns:
        dict: Response data
    """
    return_data = []
    nats_client = None
    response = None

    request_guid = str(uuid.uuid4())

    log.debug("Starting NATS connection")
    nats_client = await nats.connect(servers=[NATS_URL])
    log.debug("NATS connected")

    # Wait for the response with a timeout (customize as necessary)
    log.debug("Setting up NATS response listener")
    result_subject = (f"{NATS_RESULT_SUBJECT}.{ENVIRONMENT}.{LOCATION}"
                        f".{request_guid}")
    response = await nats_client.subscribe(result_subject)
    log.debug("NATS response listener set up")

    # Prepare request with correlation
    req = {
        'process_guid': PROCESS_GUID,
        'correlation': correlation,
        'results_subject': request_guid,
        'path': path,
        'auth_token': auth_token or "",
        'data': data
    }

    # Publish work request and wait for result
    log.debug("Publishing request to NATS")
    scoped_channel = f"{channel}.{ENVIRONMENT}.{LOCATION}"
    await nats_client.publish(
        scoped_channel,
        json.dumps(req).encode())
    log.debug("Request published to NATS")

    try:
        async with asyncio.timeout(301):  # 30 seconds timeout
            async for msg in response.messages:
                log.debug("Received Message in NATS %s", msg)
                data = json.loads(msg.data.decode('utf-8'))
                if data['correlation'] == correlation:
                    log.debug("Message matched %s. Processing",correlation)
                    # StreamItems must have a datatype
                    datatype = "error"
                    if 'item_type' in data:
                        datatype = data['item_type']
                    else:
                        data['item_type'] = 'error'
                        data['error'] = "No item_type in message"
                        
                    if datatype == "progress":
                        if data['progress'] == 100:
                            break
                        else:
                            #we just iterate through as we ignore progress messages in sync mode
                            pass

                    elif datatype == "error":
                        return_data = []
                        return_data.append(data)
                        break
                    else:
                        return_data.append(data)
                else:
                    log.debug("Message ignored")
    except Exception as e: # pylint: disable=broad-except
        log.error("Error processing NATS message: %s", str(e))
        raise
    finally:
        # Clean up NATS client
        if response is not None:
            await response.unsubscribe()
        if nats_client is not None:
            await nats_client.flush()
            await nats_client.close()
    
    return return_data
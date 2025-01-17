"""API routes for automation endpoints."""
import asyncio
import json
import logging
import os
import uuid
from http import HTTPStatus

import nats
from cryptid import location
from fastapi import APIRouter, HTTPException
from nats.errors import ConnectionClosedError, NoServersError
from opentelemetry import trace
from pydantic import BaseModel

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

NATS_URL = os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')
STATUS_SUBJECT = "result"
ENVIRONMENT = os.getenv('MYTHICA_ENVIRONMENT', 'debug')
LOCATION = location.location()
PROCESS_GUID = str(uuid.uuid4())

router = APIRouter(prefix="/automation", tags=["automation"])

async def nats_submit(channel: str, path: str, data: dict, work_guid: str, auth_token: str) -> dict:
    """Submit work to NATS.
    
    Args:
        channel: NATS channel to submit to
        path: Automation path
        data: Request data
        work_guid: Work identifier
        auth_token: Authorization token
        
    Returns:
        dict: Response data
    """
    return_data = None
    nats_client = None
    response = None

    log.debug("Starting NATS connection")
    nats_client = await nats.connect(servers=[NATS_URL])
    log.debug("NATS connected")

    # Wait for the response with a timeout (customize as necessary)
    log.debug("Setting up NATS response listener")
    result_subject = (f"{STATUS_SUBJECT}.{ENVIRONMENT}.{LOCATION}"
                        f".{PROCESS_GUID}")
    response = await nats_client.subscribe(result_subject)
    log.debug("NATS response listener set up")

    # Prepare request with work_guid
    req = {
        'process_guid': PROCESS_GUID,
        'work_guid': work_guid,
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
                if data['correlation'] == work_guid:
                    log.debug("Message matched %s. Processing",work_guid)
                    datatype = "result"
                    if 'item_type' in data:
                        datatype = data['item_type']
                    if datatype != "progress":
                        return_data = data
                        break
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

class AutomationRequest(BaseModel):
    """Request model for automation endpoints."""
    work_guid: str
    channel: str
    path: str
    data: dict
    auth_token: str = None

class AutomationResponse(BaseModel):
    """Response model for automation endpoints."""
    work_guid: str
    result: dict

@router.post('/run', status_code=HTTPStatus.CREATED)
def automation_request(request: AutomationRequest) -> AutomationResponse:
    """Handle automation request.
    
    Args:
        request: Automation request
        
    Returns:
        AutomationResponse
        
    Raises:
        HTTPException: On errors
    """
    request_data = request.model_dump()
    log.info("request - %s", request_data)

    work_guid = request_data['work_guid'] or str(uuid.uuid4())
    channel = request_data['channel']
    path = request_data['path']

    log.info("processing automation: work_guid: %s; path: %s; channel: %s",
        work_guid, path, channel)

    data = request_data['data']
    auth_token = request_data.get('auth_token')

    if not channel:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Channel not defined in request"
        )

    try:
        result = asyncio.run(nats_submit(
            channel,
            path,
            data,
            work_guid,
            auth_token))
    except ConnectionClosedError as exc:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail='NATS connection closed'
        ) from exc
    except TimeoutError as exc:
        raise HTTPException(
            status_code=HTTPStatus.GATEWAY_TIMEOUT,
            detail='NATS connection timed out'
        ) from exc
    except NoServersError as exc:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail='No servers available for NATS connection'
        ) from exc
    except Exception as exc:
        log.error("Unexpected error: %s", exc)
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail='Unexpected error occurred'
        ) from exc

    log.info("response - %s", result)

    # Return the result
    return AutomationResponse(
        work_guid=work_guid,
        result=result
    )

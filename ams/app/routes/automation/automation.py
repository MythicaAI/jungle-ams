"""API routes for automation endpoints."""
import asyncio
import logging
import uuid
from http import HTTPStatus
import os

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from nats.errors import ConnectionClosedError, NoServersError
from nats.aio.client import Client as NATS
from opentelemetry import trace
from pydantic import BaseModel
from ripple.automation.utils import nats_submit
import contextlib
from create_app import get_nats

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/automation", tags=["automation"])

class AutomationRequest(BaseModel):
    """Request model for automation endpoints."""
    correlation: str
    channel: str
    path: str
    data: dict
    auth_token: str = None

class AutomationResponse(BaseModel):
    """Response model for automation endpoints."""
    correlation: str
    result: dict|list[dict]

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

    correlation = request_data['correlation'] or str(uuid.uuid4())
    channel = request_data['channel']
    path = request_data['path']

    log.info("processing automation: correlation: %s; path: %s; channel: %s",
        correlation, path, channel)

    data = request_data['data']
    auth_token = request_data.get('auth_token')

    if not channel:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Channel not defined in request"
        )

    try:
        result = nats_submit(
            channel,
            path,
            data,
            correlation,
            auth_token)
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
        correlation=correlation,
        result=result.pop() if len(result) >0 else None
    )


@router.websocket("/automation/lsp")
async def lsp_ws_endpoint(websocket: WebSocket, channel_type: str = Query(...)):
    await websocket.accept()
    session_id = str(uuid.uuid4())
    in_subject = f"lsp.session.{channel_type}.{session_id}.in"
    out_subject = f"lsp.session.{channel_type}.{session_id}.out"

    nc = get_nats()
    sub = await nc.subscribe(out_subject)

    async def ws_to_nats():
        try:
            async for message in websocket.iter_text():
                await nc.publish(in_subject, message.encode())
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"[ws_to_nats] error: {e}")

    async def nats_to_ws():
        try:
            async for msg in sub.messages:
                await websocket.send_text(msg.data.decode())
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"[nats_to_ws] error: {e}")

    tasks = [asyncio.create_task(ws_to_nats()), asyncio.create_task(nats_to_ws())]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)

    for task in pending:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task

    await nc.unsubscribe(sub.sid)
    await nc.flush()
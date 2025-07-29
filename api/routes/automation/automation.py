"""API routes for automation endpoints."""
import logging
import uuid
from http import HTTPStatus

from fastapi import APIRouter, HTTPException
from nats.errors import ConnectionClosedError, NoServersError
from opentelemetry import trace
from pydantic import BaseModel
from meshwork.automation.utils import nats_submit

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
    result: dict | list[dict]


@router.post("/run", status_code=HTTPStatus.CREATED)
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

    correlation = request_data["correlation"] or str(uuid.uuid4())
    channel = request_data["channel"]
    path = request_data["path"]

    log.info("processing automation: correlation: %s; path: %s; channel: %s",
             correlation, path, channel)

    data = request_data["data"]
    auth_token = request_data.get("auth_token")

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
            detail="NATS connection closed"
        ) from exc
    except TimeoutError as exc:
        raise HTTPException(
            status_code=HTTPStatus.GATEWAY_TIMEOUT,
            detail="NATS connection timed out"
        ) from exc
    except NoServersError as exc:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail="No servers available for NATS connection"
        ) from exc
    except Exception as exc:
        log.error("Unexpected error: %s", exc)
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred"
        ) from exc

    log.info("response - %s", result)

    # Return the result
    return AutomationResponse(
        correlation=correlation,
        result=result.pop() if len(result) > 0 else None
    )

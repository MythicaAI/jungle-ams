from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.org_response import OrgResponse
from ...models.org_update_request import OrgUpdateRequest
from ...types import Response


def _get_kwargs(
    org_id: str,
    *,
    body: OrgUpdateRequest,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/orgs/{org_id}",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, OrgResponse]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = OrgResponse.from_dict(response.json())

        return response_200
    if response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY:
        response_422 = HTTPValidationError.from_dict(response.json())

        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[HTTPValidationError, OrgResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    org_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: OrgUpdateRequest,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, OrgResponse]]:
    """Update Org

     Update an existing organization

    Args:
        org_id (str):
        authorization (Union[None, str]):
        body (OrgUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, OrgResponse]]
    """

    kwargs = _get_kwargs(
        org_id=org_id,
        body=body,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    org_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: OrgUpdateRequest,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, OrgResponse]]:
    """Update Org

     Update an existing organization

    Args:
        org_id (str):
        authorization (Union[None, str]):
        body (OrgUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, OrgResponse]
    """

    return sync_detailed(
        org_id=org_id,
        client=client,
        body=body,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    org_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: OrgUpdateRequest,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, OrgResponse]]:
    """Update Org

     Update an existing organization

    Args:
        org_id (str):
        authorization (Union[None, str]):
        body (OrgUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, OrgResponse]]
    """

    kwargs = _get_kwargs(
        org_id=org_id,
        body=body,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    org_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: OrgUpdateRequest,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, OrgResponse]]:
    """Update Org

     Update an existing organization

    Args:
        org_id (str):
        authorization (Union[None, str]):
        body (OrgUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, OrgResponse]
    """

    return (
        await asyncio_detailed(
            org_id=org_id,
            client=client,
            body=body,
            authorization=authorization,
        )
    ).parsed

from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.topology_create_update_request import TopologyCreateUpdateRequest
from ...models.topology_response import TopologyResponse
from ...types import Response


def _get_kwargs(
    topo_id: str,
    *,
    body: TopologyCreateUpdateRequest,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/topos/{topo_id}",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, TopologyResponse]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = TopologyResponse.from_dict(response.json())

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
) -> Response[Union[HTTPValidationError, TopologyResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: TopologyCreateUpdateRequest,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, TopologyResponse]]:
    """Update Topology

     Update an existing topology

    Args:
        topo_id (str):
        authorization (Union[None, str]):
        body (TopologyCreateUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, TopologyResponse]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
        body=body,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: TopologyCreateUpdateRequest,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, TopologyResponse]]:
    """Update Topology

     Update an existing topology

    Args:
        topo_id (str):
        authorization (Union[None, str]):
        body (TopologyCreateUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, TopologyResponse]
    """

    return sync_detailed(
        topo_id=topo_id,
        client=client,
        body=body,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: TopologyCreateUpdateRequest,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, TopologyResponse]]:
    """Update Topology

     Update an existing topology

    Args:
        topo_id (str):
        authorization (Union[None, str]):
        body (TopologyCreateUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, TopologyResponse]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
        body=body,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: TopologyCreateUpdateRequest,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, TopologyResponse]]:
    """Update Topology

     Update an existing topology

    Args:
        topo_id (str):
        authorization (Union[None, str]):
        body (TopologyCreateUpdateRequest):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, TopologyResponse]
    """

    return (
        await asyncio_detailed(
            topo_id=topo_id,
            client=client,
            body=body,
            authorization=authorization,
        )
    ).parsed

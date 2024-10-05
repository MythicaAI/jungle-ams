from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.topology_ref_response import TopologyRefResponse
from ...types import Response


def _get_kwargs(
    topo_id: str,
) -> Dict[str, Any]:
    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/topos/{topo_id}/refs",
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = TopologyRefResponse.from_dict(response_200_item_data)

            response_200.append(response_200_item)

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
) -> Response[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
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
) -> Response[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
    """Get Topology Refs

     Get all topology refs

    Args:
        topo_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['TopologyRefResponse']]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
    """Get Topology Refs

     Get all topology refs

    Args:
        topo_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['TopologyRefResponse']]
    """

    return sync_detailed(
        topo_id=topo_id,
        client=client,
    ).parsed


async def asyncio_detailed(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
    """Get Topology Refs

     Get all topology refs

    Args:
        topo_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['TopologyRefResponse']]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    topo_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[HTTPValidationError, List["TopologyRefResponse"]]]:
    """Get Topology Refs

     Get all topology refs

    Args:
        topo_id (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['TopologyRefResponse']]
    """

    return (
        await asyncio_detailed(
            topo_id=topo_id,
            client=client,
        )
    ).parsed

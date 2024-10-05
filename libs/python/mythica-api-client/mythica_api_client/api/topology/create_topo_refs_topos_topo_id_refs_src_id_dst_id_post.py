from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.create_topo_refs_topos_topo_id_refs_src_id_dst_id_post_edge_data import (
    CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
)
from ...models.http_validation_error import HTTPValidationError
from ...models.topology_ref_response import TopologyRefResponse
from ...types import Response


def _get_kwargs(
    topo_id: str,
    src_id: str,
    dst_id: str,
    *,
    body: CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/topos/{topo_id}/refs/{src_id}/{dst_id}",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, TopologyRefResponse]]:
    if response.status_code == HTTPStatus.CREATED:
        response_201 = TopologyRefResponse.from_dict(response.json())

        return response_201
    if response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY:
        response_422 = HTTPValidationError.from_dict(response.json())

        return response_422
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[HTTPValidationError, TopologyRefResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    topo_id: str,
    src_id: str,
    dst_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, TopologyRefResponse]]:
    """Create Topo Refs

     Create a new topology ref

    Args:
        topo_id (str):
        src_id (str):
        dst_id (str):
        authorization (Union[None, str]):
        body (CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, TopologyRefResponse]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
        src_id=src_id,
        dst_id=dst_id,
        body=body,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    topo_id: str,
    src_id: str,
    dst_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, TopologyRefResponse]]:
    """Create Topo Refs

     Create a new topology ref

    Args:
        topo_id (str):
        src_id (str):
        dst_id (str):
        authorization (Union[None, str]):
        body (CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, TopologyRefResponse]
    """

    return sync_detailed(
        topo_id=topo_id,
        src_id=src_id,
        dst_id=dst_id,
        client=client,
        body=body,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    topo_id: str,
    src_id: str,
    dst_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, TopologyRefResponse]]:
    """Create Topo Refs

     Create a new topology ref

    Args:
        topo_id (str):
        src_id (str):
        dst_id (str):
        authorization (Union[None, str]):
        body (CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, TopologyRefResponse]]
    """

    kwargs = _get_kwargs(
        topo_id=topo_id,
        src_id=src_id,
        dst_id=dst_id,
        body=body,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    topo_id: str,
    src_id: str,
    dst_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, TopologyRefResponse]]:
    """Create Topo Refs

     Create a new topology ref

    Args:
        topo_id (str):
        src_id (str):
        dst_id (str):
        authorization (Union[None, str]):
        body (CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, TopologyRefResponse]
    """

    return (
        await asyncio_detailed(
            topo_id=topo_id,
            src_id=src_id,
            dst_id=dst_id,
            client=client,
            body=body,
            authorization=authorization,
        )
    ).parsed

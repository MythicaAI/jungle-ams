from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...types import Response


def _get_kwargs(
    reader_id: str,
    *,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "delete",
        "url": f"/readers/{reader_id}",
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[Any, HTTPValidationError]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = response.json()
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
) -> Response[Union[Any, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[Any, HTTPValidationError]]:
    """Delete Reader

     Delete a reader by ID

    Args:
        reader_id (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        reader_id=reader_id,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[Any, HTTPValidationError]]:
    """Delete Reader

     Delete a reader by ID

    Args:
        reader_id (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, HTTPValidationError]
    """

    return sync_detailed(
        reader_id=reader_id,
        client=client,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[Any, HTTPValidationError]]:
    """Delete Reader

     Delete a reader by ID

    Args:
        reader_id (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        reader_id=reader_id,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[Any, HTTPValidationError]]:
    """Delete Reader

     Delete a reader by ID

    Args:
        reader_id (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, HTTPValidationError]
    """

    return (
        await asyncio_detailed(
            reader_id=reader_id,
            client=client,
            authorization=authorization,
        )
    ).parsed

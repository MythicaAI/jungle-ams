from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.asset_version_result import AssetVersionResult
from ...models.http_validation_error import HTTPValidationError
from ...types import Response


def _get_kwargs(
    asset_id: str,
    version_str: str,
) -> Dict[str, Any]:
    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/assets/{asset_id}/versions/{version_str}",
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[AssetVersionResult, HTTPValidationError]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = AssetVersionResult.from_dict(response.json())

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
) -> Response[Union[AssetVersionResult, HTTPValidationError]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[Union[AssetVersionResult, HTTPValidationError]]:
    """Get Asset Version By Id

     Get the asset version for a given asset and version

    Args:
        asset_id (str):
        version_str (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[AssetVersionResult, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        version_str=version_str,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[AssetVersionResult, HTTPValidationError]]:
    """Get Asset Version By Id

     Get the asset version for a given asset and version

    Args:
        asset_id (str):
        version_str (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[AssetVersionResult, HTTPValidationError]
    """

    return sync_detailed(
        asset_id=asset_id,
        version_str=version_str,
        client=client,
    ).parsed


async def asyncio_detailed(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Response[Union[AssetVersionResult, HTTPValidationError]]:
    """Get Asset Version By Id

     Get the asset version for a given asset and version

    Args:
        asset_id (str):
        version_str (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[AssetVersionResult, HTTPValidationError]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        version_str=version_str,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
) -> Optional[Union[AssetVersionResult, HTTPValidationError]]:
    """Get Asset Version By Id

     Get the asset version for a given asset and version

    Args:
        asset_id (str):
        version_str (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[AssetVersionResult, HTTPValidationError]
    """

    return (
        await asyncio_detailed(
            asset_id=asset_id,
            version_str=version_str,
            client=client,
        )
    ).parsed

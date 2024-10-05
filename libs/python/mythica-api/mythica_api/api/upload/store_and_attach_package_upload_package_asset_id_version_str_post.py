from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.body_store_and_attach_package_upload_package_asset_id_version_str_post import (
    BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
)
from ...models.http_validation_error import HTTPValidationError
from ...models.upload_response import UploadResponse
from ...types import Response


def _get_kwargs(
    asset_id: str,
    version_str: str,
    *,
    body: BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/upload/package/{asset_id}/{version_str}",
    }

    _body = body.to_multipart()

    _kwargs["files"] = _body

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, UploadResponse]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = UploadResponse.from_dict(response.json())

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
) -> Response[Union[HTTPValidationError, UploadResponse]]:
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
    body: BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
) -> Response[Union[HTTPValidationError, UploadResponse]]:
    """Store And Attach Package

     Provide a package upload to a specific asset and version

    Args:
        asset_id (str):
        version_str (str):
        body (BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, UploadResponse]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        version_str=version_str,
        body=body,
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
    body: BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
) -> Optional[Union[HTTPValidationError, UploadResponse]]:
    """Store And Attach Package

     Provide a package upload to a specific asset and version

    Args:
        asset_id (str):
        version_str (str):
        body (BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, UploadResponse]
    """

    return sync_detailed(
        asset_id=asset_id,
        version_str=version_str,
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
) -> Response[Union[HTTPValidationError, UploadResponse]]:
    """Store And Attach Package

     Provide a package upload to a specific asset and version

    Args:
        asset_id (str):
        version_str (str):
        body (BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, UploadResponse]]
    """

    kwargs = _get_kwargs(
        asset_id=asset_id,
        version_str=version_str,
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    asset_id: str,
    version_str: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost,
) -> Optional[Union[HTTPValidationError, UploadResponse]]:
    """Store And Attach Package

     Provide a package upload to a specific asset and version

    Args:
        asset_id (str):
        version_str (str):
        body (BodyStoreAndAttachPackageUploadPackageAssetIdVersionStrPost):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, UploadResponse]
    """

    return (
        await asyncio_detailed(
            asset_id=asset_id,
            version_str=version_str,
            client=client,
            body=body,
        )
    ).parsed

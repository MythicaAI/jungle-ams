from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.create_update_profile_model import CreateUpdateProfileModel
from ...models.http_validation_error import HTTPValidationError
from ...models.profile_response import ProfileResponse
from ...types import Response


def _get_kwargs(
    profile_id: str,
    *,
    body: CreateUpdateProfileModel,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/profiles/{profile_id}",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, ProfileResponse]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = ProfileResponse.from_dict(response.json())

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
) -> Response[Union[HTTPValidationError, ProfileResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    profile_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateUpdateProfileModel,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, ProfileResponse]]:
    """Update Profile

     Update the profile of the owning account

    Args:
        profile_id (str):
        authorization (Union[None, str]):
        body (CreateUpdateProfileModel): A model with only allowed public properties for profile
            creation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, ProfileResponse]]
    """

    kwargs = _get_kwargs(
        profile_id=profile_id,
        body=body,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    profile_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateUpdateProfileModel,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, ProfileResponse]]:
    """Update Profile

     Update the profile of the owning account

    Args:
        profile_id (str):
        authorization (Union[None, str]):
        body (CreateUpdateProfileModel): A model with only allowed public properties for profile
            creation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, ProfileResponse]
    """

    return sync_detailed(
        profile_id=profile_id,
        client=client,
        body=body,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    profile_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateUpdateProfileModel,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, ProfileResponse]]:
    """Update Profile

     Update the profile of the owning account

    Args:
        profile_id (str):
        authorization (Union[None, str]):
        body (CreateUpdateProfileModel): A model with only allowed public properties for profile
            creation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, ProfileResponse]]
    """

    kwargs = _get_kwargs(
        profile_id=profile_id,
        body=body,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    profile_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    body: CreateUpdateProfileModel,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, ProfileResponse]]:
    """Update Profile

     Update the profile of the owning account

    Args:
        profile_id (str):
        authorization (Union[None, str]):
        body (CreateUpdateProfileModel): A model with only allowed public properties for profile
            creation

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, ProfileResponse]
    """

    return (
        await asyncio_detailed(
            profile_id=profile_id,
            client=client,
            body=body,
            authorization=authorization,
        )
    ).parsed

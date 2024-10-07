from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.org_ref_response import OrgRefResponse
from ...types import Response


def _get_kwargs(
    org_id: str,
    profile_id: str,
    role: str,
    *,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "delete",
        "url": f"/orgs/{org_id}/roles/{profile_id}/{role}",
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = OrgRefResponse.from_dict(response_200_item_data)

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
) -> Response[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    org_id: str,
    profile_id: str,
    role: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    """Remove Role From Org

     Delete a role from an organization

    Args:
        org_id (str):
        profile_id (str):
        role (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['OrgRefResponse']]]
    """

    kwargs = _get_kwargs(
        org_id=org_id,
        profile_id=profile_id,
        role=role,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    org_id: str,
    profile_id: str,
    role: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    """Remove Role From Org

     Delete a role from an organization

    Args:
        org_id (str):
        profile_id (str):
        role (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['OrgRefResponse']]
    """

    return sync_detailed(
        org_id=org_id,
        profile_id=profile_id,
        role=role,
        client=client,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    org_id: str,
    profile_id: str,
    role: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    """Remove Role From Org

     Delete a role from an organization

    Args:
        org_id (str):
        profile_id (str):
        role (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['OrgRefResponse']]]
    """

    kwargs = _get_kwargs(
        org_id=org_id,
        profile_id=profile_id,
        role=role,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    org_id: str,
    profile_id: str,
    role: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, List["OrgRefResponse"]]]:
    """Remove Role From Org

     Delete a role from an organization

    Args:
        org_id (str):
        profile_id (str):
        role (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['OrgRefResponse']]
    """

    return (
        await asyncio_detailed(
            org_id=org_id,
            profile_id=profile_id,
            role=role,
            client=client,
            authorization=authorization,
        )
    ).parsed

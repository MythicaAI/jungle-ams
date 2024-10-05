from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.public_profile_response import PublicProfileResponse
from ...types import UNSET, Response, Unset


def _get_kwargs(
    profile_name: str,
    *,
    exact_match: Union[None, Unset, bool] = False,
) -> Dict[str, Any]:
    params: Dict[str, Any] = {}

    json_exact_match: Union[None, Unset, bool]
    if isinstance(exact_match, Unset):
        json_exact_match = UNSET
    else:
        json_exact_match = exact_match
    params["exact_match"] = json_exact_match

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/profiles/named/{profile_name}",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = PublicProfileResponse.from_dict(response_200_item_data)

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
) -> Response[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    profile_name: str,
    *,
    client: Union[AuthenticatedClient, Client],
    exact_match: Union[None, Unset, bool] = False,
) -> Response[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    """Get Profile By Name

     Get asset by name

    Args:
        profile_name (str):
        exact_match (Union[None, Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['PublicProfileResponse']]]
    """

    kwargs = _get_kwargs(
        profile_name=profile_name,
        exact_match=exact_match,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    profile_name: str,
    *,
    client: Union[AuthenticatedClient, Client],
    exact_match: Union[None, Unset, bool] = False,
) -> Optional[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    """Get Profile By Name

     Get asset by name

    Args:
        profile_name (str):
        exact_match (Union[None, Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['PublicProfileResponse']]
    """

    return sync_detailed(
        profile_name=profile_name,
        client=client,
        exact_match=exact_match,
    ).parsed


async def asyncio_detailed(
    profile_name: str,
    *,
    client: Union[AuthenticatedClient, Client],
    exact_match: Union[None, Unset, bool] = False,
) -> Response[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    """Get Profile By Name

     Get asset by name

    Args:
        profile_name (str):
        exact_match (Union[None, Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List['PublicProfileResponse']]]
    """

    kwargs = _get_kwargs(
        profile_name=profile_name,
        exact_match=exact_match,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    profile_name: str,
    *,
    client: Union[AuthenticatedClient, Client],
    exact_match: Union[None, Unset, bool] = False,
) -> Optional[Union[HTTPValidationError, List["PublicProfileResponse"]]]:
    """Get Profile By Name

     Get asset by name

    Args:
        profile_name (str):
        exact_match (Union[None, Unset, bool]):  Default: False.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List['PublicProfileResponse']]
    """

    return (
        await asyncio_detailed(
            profile_name=profile_name,
            client=client,
            exact_match=exact_match,
        )
    ).parsed

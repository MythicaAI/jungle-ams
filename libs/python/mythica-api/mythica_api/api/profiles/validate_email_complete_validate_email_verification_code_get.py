from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.http_validation_error import HTTPValidationError
from ...models.validate_email_response import ValidateEmailResponse
from ...types import Response


def _get_kwargs(
    verification_code: str,
    *,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/validate-email/{verification_code}",
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, ValidateEmailResponse]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = ValidateEmailResponse.from_dict(response.json())

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
) -> Response[Union[HTTPValidationError, ValidateEmailResponse]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    verification_code: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, ValidateEmailResponse]]:
    """Validate Email Complete

     Provide a valid verification code to validate email

    Args:
        verification_code (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, ValidateEmailResponse]]
    """

    kwargs = _get_kwargs(
        verification_code=verification_code,
        authorization=authorization,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    verification_code: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, ValidateEmailResponse]]:
    """Validate Email Complete

     Provide a valid verification code to validate email

    Args:
        verification_code (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, ValidateEmailResponse]
    """

    return sync_detailed(
        verification_code=verification_code,
        client=client,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    verification_code: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, ValidateEmailResponse]]:
    """Validate Email Complete

     Provide a valid verification code to validate email

    Args:
        verification_code (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, ValidateEmailResponse]]
    """

    kwargs = _get_kwargs(
        verification_code=verification_code,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    verification_code: str,
    *,
    client: Union[AuthenticatedClient, Client],
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, ValidateEmailResponse]]:
    """Validate Email Complete

     Provide a valid verification code to validate email

    Args:
        verification_code (str):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, ValidateEmailResponse]
    """

    return (
        await asyncio_detailed(
            verification_code=verification_code,
            client=client,
            authorization=authorization,
        )
    ).parsed

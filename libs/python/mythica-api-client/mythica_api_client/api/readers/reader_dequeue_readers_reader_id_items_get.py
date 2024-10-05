from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.event import Event
from ...models.http_validation_error import HTTPValidationError
from ...models.message import Message
from ...models.output_files import OutputFiles
from ...models.progress import Progress
from ...types import UNSET, Response, Unset


def _get_kwargs(
    reader_id: str,
    *,
    before: Union[None, Unset, str] = UNSET,
    after: Union[None, Unset, str] = UNSET,
    authorization: Union[None, str],
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}
    headers["authorization"] = authorization

    params: Dict[str, Any] = {}

    json_before: Union[None, Unset, str]
    if isinstance(before, Unset):
        json_before = UNSET
    else:
        json_before = before
    params["before"] = json_before

    json_after: Union[None, Unset, str]
    if isinstance(after, Unset):
        json_after = UNSET
    else:
        json_after = after
    params["after"] = json_after

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/readers/{reader_id}/items",
        "params": params,
    }

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:

            def _parse_response_200_item(data: object) -> Union["Event", "Message", "OutputFiles", "Progress"]:
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    response_200_item_type_0 = Progress.from_dict(data)

                    return response_200_item_type_0
                except:  # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    response_200_item_type_1 = Message.from_dict(data)

                    return response_200_item_type_1
                except:  # noqa: E722
                    pass
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    response_200_item_type_2 = OutputFiles.from_dict(data)

                    return response_200_item_type_2
                except:  # noqa: E722
                    pass
                if not isinstance(data, dict):
                    raise TypeError()
                response_200_item_type_3 = Event.from_dict(data)

                return response_200_item_type_3

            response_200_item = _parse_response_200_item(response_200_item_data)

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
) -> Response[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
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
    before: Union[None, Unset, str] = UNSET,
    after: Union[None, Unset, str] = UNSET,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
    """Reader Dequeue

     Dequeue items from the reader

    Args:
        reader_id (str):
        before (Union[None, Unset, str]):
        after (Union[None, Unset, str]):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List[Union['Event', 'Message', 'OutputFiles', 'Progress']]]]
    """

    kwargs = _get_kwargs(
        reader_id=reader_id,
        before=before,
        after=after,
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
    before: Union[None, Unset, str] = UNSET,
    after: Union[None, Unset, str] = UNSET,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
    """Reader Dequeue

     Dequeue items from the reader

    Args:
        reader_id (str):
        before (Union[None, Unset, str]):
        after (Union[None, Unset, str]):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List[Union['Event', 'Message', 'OutputFiles', 'Progress']]]
    """

    return sync_detailed(
        reader_id=reader_id,
        client=client,
        before=before,
        after=after,
        authorization=authorization,
    ).parsed


async def asyncio_detailed(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    before: Union[None, Unset, str] = UNSET,
    after: Union[None, Unset, str] = UNSET,
    authorization: Union[None, str],
) -> Response[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
    """Reader Dequeue

     Dequeue items from the reader

    Args:
        reader_id (str):
        before (Union[None, Unset, str]):
        after (Union[None, Unset, str]):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[HTTPValidationError, List[Union['Event', 'Message', 'OutputFiles', 'Progress']]]]
    """

    kwargs = _get_kwargs(
        reader_id=reader_id,
        before=before,
        after=after,
        authorization=authorization,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    reader_id: str,
    *,
    client: Union[AuthenticatedClient, Client],
    before: Union[None, Unset, str] = UNSET,
    after: Union[None, Unset, str] = UNSET,
    authorization: Union[None, str],
) -> Optional[Union[HTTPValidationError, List[Union["Event", "Message", "OutputFiles", "Progress"]]]]:
    """Reader Dequeue

     Dequeue items from the reader

    Args:
        reader_id (str):
        before (Union[None, Unset, str]):
        after (Union[None, Unset, str]):
        authorization (Union[None, str]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[HTTPValidationError, List[Union['Event', 'Message', 'OutputFiles', 'Progress']]]
    """

    return (
        await asyncio_detailed(
            reader_id=reader_id,
            client=client,
            before=before,
            after=after,
            authorization=authorization,
        )
    ).parsed

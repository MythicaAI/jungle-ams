import datetime
from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="FileUploadResponse")


@_attrs_define
class FileUploadResponse:
    """
    Attributes:
        file_id (str):
        owner_id (str):
        file_name (str):
        event_ids (List[str]):
        size (int):
        content_type (str):
        created (datetime.datetime):
        content_hash (Union[Unset, str]):  Default: ''.
    """

    file_id: str
    owner_id: str
    file_name: str
    event_ids: List[str]
    size: int
    content_type: str
    created: datetime.datetime
    content_hash: Union[Unset, str] = ""
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        file_id = self.file_id

        owner_id = self.owner_id

        file_name = self.file_name

        event_ids = self.event_ids

        size = self.size

        content_type = self.content_type

        created = self.created.isoformat()

        content_hash = self.content_hash

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "file_id": file_id,
                "owner_id": owner_id,
                "file_name": file_name,
                "event_ids": event_ids,
                "size": size,
                "content_type": content_type,
                "created": created,
            }
        )
        if content_hash is not UNSET:
            field_dict["content_hash"] = content_hash

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        file_id = d.pop("file_id")

        owner_id = d.pop("owner_id")

        file_name = d.pop("file_name")

        event_ids = cast(List[str], d.pop("event_ids"))

        size = d.pop("size")

        content_type = d.pop("content_type")

        created = isoparse(d.pop("created"))

        content_hash = d.pop("content_hash", UNSET)

        file_upload_response = cls(
            file_id=file_id,
            owner_id=owner_id,
            file_name=file_name,
            event_ids=event_ids,
            size=size,
            content_type=content_type,
            created=created,
            content_hash=content_hash,
        )

        file_upload_response.additional_properties = d
        return file_upload_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties

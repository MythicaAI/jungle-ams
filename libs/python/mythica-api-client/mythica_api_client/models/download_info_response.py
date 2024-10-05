from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="DownloadInfoResponse")


@_attrs_define
class DownloadInfoResponse:
    """
    Attributes:
        file_id (str):
        owner_id (str):
        name (str):
        size (int):
        content_type (str):
        content_hash (str):
        url (str):
    """

    file_id: str
    owner_id: str
    name: str
    size: int
    content_type: str
    content_hash: str
    url: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        file_id = self.file_id

        owner_id = self.owner_id

        name = self.name

        size = self.size

        content_type = self.content_type

        content_hash = self.content_hash

        url = self.url

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "file_id": file_id,
                "owner_id": owner_id,
                "name": name,
                "size": size,
                "content_type": content_type,
                "content_hash": content_hash,
                "url": url,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        file_id = d.pop("file_id")

        owner_id = d.pop("owner_id")

        name = d.pop("name")

        size = d.pop("size")

        content_type = d.pop("content_type")

        content_hash = d.pop("content_hash")

        url = d.pop("url")

        download_info_response = cls(
            file_id=file_id,
            owner_id=owner_id,
            name=name,
            size=size,
            content_type=content_type,
            content_hash=content_hash,
            url=url,
        )

        download_info_response.additional_properties = d
        return download_info_response

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

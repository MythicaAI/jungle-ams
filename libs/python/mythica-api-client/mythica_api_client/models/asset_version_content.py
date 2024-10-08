from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AssetVersionContent")


@_attrs_define
class AssetVersionContent:
    """Embedded content in an asset version. When creating a new asset version
    it is only required to specify the ID of the file media and the relative
    file name of the content in the package. When the file is resolved during the
    creation of the version it will receive the content hash and size from the underlying
    file_id

        Attributes:
            file_id (str):
            file_name (str):
            content_hash (Union[None, Unset, str]):
            size (Union[None, Unset, int]):
    """

    file_id: str
    file_name: str
    content_hash: Union[None, Unset, str] = UNSET
    size: Union[None, Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        file_id = self.file_id

        file_name = self.file_name

        content_hash: Union[None, Unset, str]
        if isinstance(self.content_hash, Unset):
            content_hash = UNSET
        else:
            content_hash = self.content_hash

        size: Union[None, Unset, int]
        if isinstance(self.size, Unset):
            size = UNSET
        else:
            size = self.size

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "file_id": file_id,
                "file_name": file_name,
            }
        )
        if content_hash is not UNSET:
            field_dict["content_hash"] = content_hash
        if size is not UNSET:
            field_dict["size"] = size

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        file_id = d.pop("file_id")

        file_name = d.pop("file_name")

        def _parse_content_hash(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        content_hash = _parse_content_hash(d.pop("content_hash", UNSET))

        def _parse_size(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        size = _parse_size(d.pop("size", UNSET))

        asset_version_content = cls(
            file_id=file_id,
            file_name=file_name,
            content_hash=content_hash,
            size=size,
        )

        asset_version_content.additional_properties = d
        return asset_version_content

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

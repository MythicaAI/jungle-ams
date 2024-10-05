from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_create_version_request_contents_type_0 import AssetCreateVersionRequestContentsType0


T = TypeVar("T", bound="AssetCreateVersionRequest")


@_attrs_define
class AssetCreateVersionRequest:
    """Create a new version of an asset with its contents

    Attributes:
        author_id (Union[None, Unset, str]):
        org_id (Union[None, Unset, str]):
        name (Union[None, Unset, str]):
        description (Union[None, Unset, str]):
        published (Union[None, Unset, bool]):  Default: False.
        commit_ref (Union[None, Unset, str]):
        contents (Union['AssetCreateVersionRequestContentsType0', None, Unset]):
    """

    author_id: Union[None, Unset, str] = UNSET
    org_id: Union[None, Unset, str] = UNSET
    name: Union[None, Unset, str] = UNSET
    description: Union[None, Unset, str] = UNSET
    published: Union[None, Unset, bool] = False
    commit_ref: Union[None, Unset, str] = UNSET
    contents: Union["AssetCreateVersionRequestContentsType0", None, Unset] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.asset_create_version_request_contents_type_0 import AssetCreateVersionRequestContentsType0

        author_id: Union[None, Unset, str]
        if isinstance(self.author_id, Unset):
            author_id = UNSET
        else:
            author_id = self.author_id

        org_id: Union[None, Unset, str]
        if isinstance(self.org_id, Unset):
            org_id = UNSET
        else:
            org_id = self.org_id

        name: Union[None, Unset, str]
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        description: Union[None, Unset, str]
        if isinstance(self.description, Unset):
            description = UNSET
        else:
            description = self.description

        published: Union[None, Unset, bool]
        if isinstance(self.published, Unset):
            published = UNSET
        else:
            published = self.published

        commit_ref: Union[None, Unset, str]
        if isinstance(self.commit_ref, Unset):
            commit_ref = UNSET
        else:
            commit_ref = self.commit_ref

        contents: Union[Dict[str, Any], None, Unset]
        if isinstance(self.contents, Unset):
            contents = UNSET
        elif isinstance(self.contents, AssetCreateVersionRequestContentsType0):
            contents = self.contents.to_dict()
        else:
            contents = self.contents

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if author_id is not UNSET:
            field_dict["author_id"] = author_id
        if org_id is not UNSET:
            field_dict["org_id"] = org_id
        if name is not UNSET:
            field_dict["name"] = name
        if description is not UNSET:
            field_dict["description"] = description
        if published is not UNSET:
            field_dict["published"] = published
        if commit_ref is not UNSET:
            field_dict["commit_ref"] = commit_ref
        if contents is not UNSET:
            field_dict["contents"] = contents

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.asset_create_version_request_contents_type_0 import AssetCreateVersionRequestContentsType0

        d = src_dict.copy()

        def _parse_author_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        author_id = _parse_author_id(d.pop("author_id", UNSET))

        def _parse_org_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        org_id = _parse_org_id(d.pop("org_id", UNSET))

        def _parse_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        name = _parse_name(d.pop("name", UNSET))

        def _parse_description(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        description = _parse_description(d.pop("description", UNSET))

        def _parse_published(data: object) -> Union[None, Unset, bool]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, bool], data)

        published = _parse_published(d.pop("published", UNSET))

        def _parse_commit_ref(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        commit_ref = _parse_commit_ref(d.pop("commit_ref", UNSET))

        def _parse_contents(data: object) -> Union["AssetCreateVersionRequestContentsType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                contents_type_0 = AssetCreateVersionRequestContentsType0.from_dict(data)

                return contents_type_0
            except:  # noqa: E722
                pass
            return cast(Union["AssetCreateVersionRequestContentsType0", None, Unset], data)

        contents = _parse_contents(d.pop("contents", UNSET))

        asset_create_version_request = cls(
            author_id=author_id,
            org_id=org_id,
            name=name,
            description=description,
            published=published,
            commit_ref=commit_ref,
            contents=contents,
        )

        asset_create_version_request.additional_properties = d
        return asset_create_version_request

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

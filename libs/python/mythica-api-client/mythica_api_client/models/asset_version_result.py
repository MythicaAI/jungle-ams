import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.asset_version_result_contents import AssetVersionResultContents


T = TypeVar("T", bound="AssetVersionResult")


@_attrs_define
class AssetVersionResult:
    """Result object for a specific asset version or the asset head object
    when no version has been created. In this case the

        Attributes:
            asset_id (str):
            owner_id (str):
            owner_name (str):
            org_id (Union[None, Unset, str]):
            org_name (Union[None, Unset, str]):
            package_id (Union[None, Unset, str]):
            author_id (Union[None, Unset, str]):
            author_name (Union[None, Unset, str]):
            name (Union[None, Unset, str]):
            description (Union[None, Unset, str]):
            published (Union[None, Unset, bool]):  Default: False.
            version (Union[Unset, List[int]]):
            commit_ref (Union[None, Unset, str]):
            created (Union[None, Unset, datetime.datetime]):
            contents (Union[Unset, AssetVersionResultContents]):
    """

    asset_id: str
    owner_id: str
    owner_name: str
    org_id: Union[None, Unset, str] = UNSET
    org_name: Union[None, Unset, str] = UNSET
    package_id: Union[None, Unset, str] = UNSET
    author_id: Union[None, Unset, str] = UNSET
    author_name: Union[None, Unset, str] = UNSET
    name: Union[None, Unset, str] = UNSET
    description: Union[None, Unset, str] = UNSET
    published: Union[None, Unset, bool] = False
    version: Union[Unset, List[int]] = UNSET
    commit_ref: Union[None, Unset, str] = UNSET
    created: Union[None, Unset, datetime.datetime] = UNSET
    contents: Union[Unset, "AssetVersionResultContents"] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        asset_id = self.asset_id

        owner_id = self.owner_id

        owner_name = self.owner_name

        org_id: Union[None, Unset, str]
        if isinstance(self.org_id, Unset):
            org_id = UNSET
        else:
            org_id = self.org_id

        org_name: Union[None, Unset, str]
        if isinstance(self.org_name, Unset):
            org_name = UNSET
        else:
            org_name = self.org_name

        package_id: Union[None, Unset, str]
        if isinstance(self.package_id, Unset):
            package_id = UNSET
        else:
            package_id = self.package_id

        author_id: Union[None, Unset, str]
        if isinstance(self.author_id, Unset):
            author_id = UNSET
        else:
            author_id = self.author_id

        author_name: Union[None, Unset, str]
        if isinstance(self.author_name, Unset):
            author_name = UNSET
        else:
            author_name = self.author_name

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

        version: Union[Unset, List[int]] = UNSET
        if not isinstance(self.version, Unset):
            version = self.version

        commit_ref: Union[None, Unset, str]
        if isinstance(self.commit_ref, Unset):
            commit_ref = UNSET
        else:
            commit_ref = self.commit_ref

        created: Union[None, Unset, str]
        if isinstance(self.created, Unset):
            created = UNSET
        elif isinstance(self.created, datetime.datetime):
            created = self.created.isoformat()
        else:
            created = self.created

        contents: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.contents, Unset):
            contents = self.contents.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "asset_id": asset_id,
                "owner_id": owner_id,
                "owner_name": owner_name,
            }
        )
        if org_id is not UNSET:
            field_dict["org_id"] = org_id
        if org_name is not UNSET:
            field_dict["org_name"] = org_name
        if package_id is not UNSET:
            field_dict["package_id"] = package_id
        if author_id is not UNSET:
            field_dict["author_id"] = author_id
        if author_name is not UNSET:
            field_dict["author_name"] = author_name
        if name is not UNSET:
            field_dict["name"] = name
        if description is not UNSET:
            field_dict["description"] = description
        if published is not UNSET:
            field_dict["published"] = published
        if version is not UNSET:
            field_dict["version"] = version
        if commit_ref is not UNSET:
            field_dict["commit_ref"] = commit_ref
        if created is not UNSET:
            field_dict["created"] = created
        if contents is not UNSET:
            field_dict["contents"] = contents

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.asset_version_result_contents import AssetVersionResultContents

        d = src_dict.copy()
        asset_id = d.pop("asset_id")

        owner_id = d.pop("owner_id")

        owner_name = d.pop("owner_name")

        def _parse_org_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        org_id = _parse_org_id(d.pop("org_id", UNSET))

        def _parse_org_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        org_name = _parse_org_name(d.pop("org_name", UNSET))

        def _parse_package_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        package_id = _parse_package_id(d.pop("package_id", UNSET))

        def _parse_author_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        author_id = _parse_author_id(d.pop("author_id", UNSET))

        def _parse_author_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        author_name = _parse_author_name(d.pop("author_name", UNSET))

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

        version = cast(List[int], d.pop("version", UNSET))

        def _parse_commit_ref(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        commit_ref = _parse_commit_ref(d.pop("commit_ref", UNSET))

        def _parse_created(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                created_type_0 = isoparse(data)

                return created_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        created = _parse_created(d.pop("created", UNSET))

        _contents = d.pop("contents", UNSET)
        contents: Union[Unset, AssetVersionResultContents]
        if isinstance(_contents, Unset):
            contents = UNSET
        else:
            contents = AssetVersionResultContents.from_dict(_contents)

        asset_version_result = cls(
            asset_id=asset_id,
            owner_id=owner_id,
            owner_name=owner_name,
            org_id=org_id,
            org_name=org_name,
            package_id=package_id,
            author_id=author_id,
            author_name=author_name,
            name=name,
            description=description,
            published=published,
            version=version,
            commit_ref=commit_ref,
            created=created,
            contents=contents,
        )

        asset_version_result.additional_properties = d
        return asset_version_result

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

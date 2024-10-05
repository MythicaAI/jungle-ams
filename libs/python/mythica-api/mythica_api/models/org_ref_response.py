import datetime
from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="OrgRefResponse")


@_attrs_define
class OrgRefResponse:
    """
    Attributes:
        org_id (str):
        org_name (str):
        profile_id (str):
        profile_name (str):
        role (str):
        author_id (str):
        author_name (str):
        created (datetime.datetime):
        description (Union[None, Unset, str]):
    """

    org_id: str
    org_name: str
    profile_id: str
    profile_name: str
    role: str
    author_id: str
    author_name: str
    created: datetime.datetime
    description: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        org_id = self.org_id

        org_name = self.org_name

        profile_id = self.profile_id

        profile_name = self.profile_name

        role = self.role

        author_id = self.author_id

        author_name = self.author_name

        created = self.created.isoformat()

        description: Union[None, Unset, str]
        if isinstance(self.description, Unset):
            description = UNSET
        else:
            description = self.description

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "org_id": org_id,
                "org_name": org_name,
                "profile_id": profile_id,
                "profile_name": profile_name,
                "role": role,
                "author_id": author_id,
                "author_name": author_name,
                "created": created,
            }
        )
        if description is not UNSET:
            field_dict["description"] = description

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        org_id = d.pop("org_id")

        org_name = d.pop("org_name")

        profile_id = d.pop("profile_id")

        profile_name = d.pop("profile_name")

        role = d.pop("role")

        author_id = d.pop("author_id")

        author_name = d.pop("author_name")

        created = isoparse(d.pop("created"))

        def _parse_description(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        description = _parse_description(d.pop("description", UNSET))

        org_ref_response = cls(
            org_id=org_id,
            org_name=org_name,
            profile_id=profile_id,
            profile_name=profile_name,
            role=role,
            author_id=author_id,
            author_name=author_name,
            created=created,
            description=description,
        )

        org_ref_response.additional_properties = d
        return org_ref_response

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

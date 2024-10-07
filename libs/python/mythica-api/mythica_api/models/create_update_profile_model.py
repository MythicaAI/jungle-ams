from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="CreateUpdateProfileModel")


@_attrs_define
class CreateUpdateProfileModel:
    """A model with only allowed public properties for profile creation

    Attributes:
        name (str):
        description (Union[None, Unset, str]):
        signature (Union[None, Unset, str]):
        profile_base_href (Union[None, Unset, str]):
        email (Union[Unset, str]):
    """

    name: str
    description: Union[None, Unset, str] = UNSET
    signature: Union[None, Unset, str] = UNSET
    profile_base_href: Union[None, Unset, str] = UNSET
    email: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        name = self.name

        description: Union[None, Unset, str]
        if isinstance(self.description, Unset):
            description = UNSET
        else:
            description = self.description

        signature: Union[None, Unset, str]
        if isinstance(self.signature, Unset):
            signature = UNSET
        else:
            signature = self.signature

        profile_base_href: Union[None, Unset, str]
        if isinstance(self.profile_base_href, Unset):
            profile_base_href = UNSET
        else:
            profile_base_href = self.profile_base_href

        email = self.email

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "name": name,
            }
        )
        if description is not UNSET:
            field_dict["description"] = description
        if signature is not UNSET:
            field_dict["signature"] = signature
        if profile_base_href is not UNSET:
            field_dict["profile_base_href"] = profile_base_href
        if email is not UNSET:
            field_dict["email"] = email

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        name = d.pop("name")

        def _parse_description(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        description = _parse_description(d.pop("description", UNSET))

        def _parse_signature(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        signature = _parse_signature(d.pop("signature", UNSET))

        def _parse_profile_base_href(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        profile_base_href = _parse_profile_base_href(d.pop("profile_base_href", UNSET))

        email = d.pop("email", UNSET)

        create_update_profile_model = cls(
            name=name,
            description=description,
            signature=signature,
            profile_base_href=profile_base_href,
            email=email,
        )

        create_update_profile_model.additional_properties = d
        return create_update_profile_model

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

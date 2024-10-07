import datetime
from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.validate_email_state import ValidateEmailState
from ..types import UNSET, Unset

T = TypeVar("T", bound="ProfileResponse")


@_attrs_define
class ProfileResponse:
    """A model with only allowed public properties for profile creation

    Attributes:
        profile_id (Union[Unset, str]):
        name (Union[None, Unset, str]):
        description (Union[None, Unset, str]):
        email (Union[None, Unset, str]):
        signature (Union[None, Unset, str]):
        profile_base_href (Union[None, Unset, str]):
        active (Union[Unset, bool]):
        created (Union[Unset, datetime.datetime]):
        updated (Union[None, Unset, datetime.datetime]):
        validate_state (Union[Unset, ValidateEmailState, int]):
    """

    profile_id: Union[Unset, str] = UNSET
    name: Union[None, Unset, str] = UNSET
    description: Union[None, Unset, str] = UNSET
    email: Union[None, Unset, str] = UNSET
    signature: Union[None, Unset, str] = UNSET
    profile_base_href: Union[None, Unset, str] = UNSET
    active: Union[Unset, bool] = UNSET
    created: Union[Unset, datetime.datetime] = UNSET
    updated: Union[None, Unset, datetime.datetime] = UNSET
    validate_state: Union[Unset, ValidateEmailState, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        profile_id = self.profile_id

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

        email: Union[None, Unset, str]
        if isinstance(self.email, Unset):
            email = UNSET
        else:
            email = self.email

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

        active = self.active

        created: Union[Unset, str] = UNSET
        if not isinstance(self.created, Unset):
            created = self.created.isoformat()

        updated: Union[None, Unset, str]
        if isinstance(self.updated, Unset):
            updated = UNSET
        elif isinstance(self.updated, datetime.datetime):
            updated = self.updated.isoformat()
        else:
            updated = self.updated

        validate_state: Union[Unset, int, str]
        if isinstance(self.validate_state, Unset):
            validate_state = UNSET
        elif isinstance(self.validate_state, ValidateEmailState):
            validate_state = self.validate_state.value
        else:
            validate_state = self.validate_state

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if profile_id is not UNSET:
            field_dict["profile_id"] = profile_id
        if name is not UNSET:
            field_dict["name"] = name
        if description is not UNSET:
            field_dict["description"] = description
        if email is not UNSET:
            field_dict["email"] = email
        if signature is not UNSET:
            field_dict["signature"] = signature
        if profile_base_href is not UNSET:
            field_dict["profile_base_href"] = profile_base_href
        if active is not UNSET:
            field_dict["active"] = active
        if created is not UNSET:
            field_dict["created"] = created
        if updated is not UNSET:
            field_dict["updated"] = updated
        if validate_state is not UNSET:
            field_dict["validate_state"] = validate_state

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        profile_id = d.pop("profile_id", UNSET)

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

        def _parse_email(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        email = _parse_email(d.pop("email", UNSET))

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

        active = d.pop("active", UNSET)

        _created = d.pop("created", UNSET)
        created: Union[Unset, datetime.datetime]
        if isinstance(_created, Unset):
            created = UNSET
        else:
            created = isoparse(_created)

        def _parse_updated(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                updated_type_0 = isoparse(data)

                return updated_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        updated = _parse_updated(d.pop("updated", UNSET))

        def _parse_validate_state(data: object) -> Union[Unset, ValidateEmailState, int]:
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                validate_state_type_0 = ValidateEmailState(data)

                return validate_state_type_0
            except:  # noqa: E722
                pass
            return cast(Union[Unset, ValidateEmailState, int], data)

        validate_state = _parse_validate_state(d.pop("validate_state", UNSET))

        profile_response = cls(
            profile_id=profile_id,
            name=name,
            description=description,
            email=email,
            signature=signature,
            profile_base_href=profile_base_href,
            active=active,
            created=created,
            updated=updated,
            validate_state=validate_state,
        )

        profile_response.additional_properties = d
        return profile_response

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

from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.validate_email_state import ValidateEmailState
from ..types import UNSET, Unset

T = TypeVar("T", bound="ValidateEmailResponse")


@_attrs_define
class ValidateEmailResponse:
    """Response returned to a email validation request

    Attributes:
        owner_id (str):
        code (str):
        link (str):
        state (Union[Unset, ValidateEmailState]): Email validation states
    """

    owner_id: str
    code: str
    link: str
    state: Union[Unset, ValidateEmailState] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        owner_id = self.owner_id

        code = self.code

        link = self.link

        state: Union[Unset, str] = UNSET
        if not isinstance(self.state, Unset):
            state = self.state.value

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "owner_id": owner_id,
                "code": code,
                "link": link,
            }
        )
        if state is not UNSET:
            field_dict["state"] = state

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        owner_id = d.pop("owner_id")

        code = d.pop("code")

        link = d.pop("link")

        _state = d.pop("state", UNSET)
        state: Union[Unset, ValidateEmailState]
        if isinstance(_state, Unset):
            state = UNSET
        else:
            state = ValidateEmailState(_state)

        validate_email_response = cls(
            owner_id=owner_id,
            code=code,
            link=link,
            state=state,
        )

        validate_email_response.additional_properties = d
        return validate_email_response

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

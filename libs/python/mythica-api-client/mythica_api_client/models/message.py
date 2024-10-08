from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.message_item_type import MessageItemType
from ..types import UNSET, Unset

T = TypeVar("T", bound="Message")


@_attrs_define
class Message:
    """Non-localized message for processes to communicate process - for
    debugging purposes.

        Attributes:
            process_guid (str):
            job_id (str):
            message (str):
            item_type (Union[Unset, MessageItemType]):  Default: MessageItemType.MESSAGE.
            index (Union[None, Unset, str]):
            correlation (Union[Unset, str]):
    """

    process_guid: str
    job_id: str
    message: str
    item_type: Union[Unset, MessageItemType] = MessageItemType.MESSAGE
    index: Union[None, Unset, str] = UNSET
    correlation: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        process_guid = self.process_guid

        job_id = self.job_id

        message = self.message

        item_type: Union[Unset, str] = UNSET
        if not isinstance(self.item_type, Unset):
            item_type = self.item_type.value

        index: Union[None, Unset, str]
        if isinstance(self.index, Unset):
            index = UNSET
        else:
            index = self.index

        correlation = self.correlation

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "process_guid": process_guid,
                "job_id": job_id,
                "message": message,
            }
        )
        if item_type is not UNSET:
            field_dict["item_type"] = item_type
        if index is not UNSET:
            field_dict["index"] = index
        if correlation is not UNSET:
            field_dict["correlation"] = correlation

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        process_guid = d.pop("process_guid")

        job_id = d.pop("job_id")

        message = d.pop("message")

        _item_type = d.pop("item_type", UNSET)
        item_type: Union[Unset, MessageItemType]
        if isinstance(_item_type, Unset):
            item_type = UNSET
        else:
            item_type = MessageItemType(_item_type)

        def _parse_index(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        index = _parse_index(d.pop("index", UNSET))

        correlation = d.pop("correlation", UNSET)

        message = cls(
            process_guid=process_guid,
            job_id=job_id,
            message=message,
            item_type=item_type,
            index=index,
            correlation=correlation,
        )

        message.additional_properties = d
        return message

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

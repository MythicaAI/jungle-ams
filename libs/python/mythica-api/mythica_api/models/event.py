from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.event_item_type import EventItemType
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.event_payload import EventPayload


T = TypeVar("T", bound="Event")


@_attrs_define
class Event:
    """An event from the events table with the payload. These events
    are indexed by the event_id

        Attributes:
            item_type (Union[Unset, EventItemType]):  Default: EventItemType.EVENT.
            index (Union[None, Unset, str]):
            correlation (Union[Unset, str]):
            payload (Union[Unset, EventPayload]):
    """

    item_type: Union[Unset, EventItemType] = EventItemType.EVENT
    index: Union[None, Unset, str] = UNSET
    correlation: Union[Unset, str] = UNSET
    payload: Union[Unset, "EventPayload"] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        item_type: Union[Unset, str] = UNSET
        if not isinstance(self.item_type, Unset):
            item_type = self.item_type.value

        index: Union[None, Unset, str]
        if isinstance(self.index, Unset):
            index = UNSET
        else:
            index = self.index

        correlation = self.correlation

        payload: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.payload, Unset):
            payload = self.payload.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if item_type is not UNSET:
            field_dict["item_type"] = item_type
        if index is not UNSET:
            field_dict["index"] = index
        if correlation is not UNSET:
            field_dict["correlation"] = correlation
        if payload is not UNSET:
            field_dict["payload"] = payload

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.event_payload import EventPayload

        d = src_dict.copy()
        _item_type = d.pop("item_type", UNSET)
        item_type: Union[Unset, EventItemType]
        if isinstance(_item_type, Unset):
            item_type = UNSET
        else:
            item_type = EventItemType(_item_type)

        def _parse_index(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        index = _parse_index(d.pop("index", UNSET))

        correlation = d.pop("correlation", UNSET)

        _payload = d.pop("payload", UNSET)
        payload: Union[Unset, EventPayload]
        if isinstance(_payload, Unset):
            payload = UNSET
        else:
            payload = EventPayload.from_dict(_payload)

        event = cls(
            item_type=item_type,
            index=index,
            correlation=correlation,
            payload=payload,
        )

        event.additional_properties = d
        return event

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

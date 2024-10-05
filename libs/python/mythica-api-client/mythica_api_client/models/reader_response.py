import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.reader_response_direction_type_0 import ReaderResponseDirectionType0
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.reader_response_params_type_0 import ReaderResponseParamsType0


T = TypeVar("T", bound="ReaderResponse")


@_attrs_define
class ReaderResponse:
    """
    Attributes:
        reader_id (str):
        owner_id (str):
        created (datetime.datetime):
        source (str):
        params (Union['ReaderResponseParamsType0', None, Unset]):
        name (Union[None, Unset, str]):
        position (Union[None, Unset, str]):
        direction (Union[None, ReaderResponseDirectionType0, Unset]):  Default: ReaderResponseDirectionType0.AFTER.
    """

    reader_id: str
    owner_id: str
    created: datetime.datetime
    source: str
    params: Union["ReaderResponseParamsType0", None, Unset] = UNSET
    name: Union[None, Unset, str] = UNSET
    position: Union[None, Unset, str] = UNSET
    direction: Union[None, ReaderResponseDirectionType0, Unset] = ReaderResponseDirectionType0.AFTER
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.reader_response_params_type_0 import ReaderResponseParamsType0

        reader_id = self.reader_id

        owner_id = self.owner_id

        created = self.created.isoformat()

        source = self.source

        params: Union[Dict[str, Any], None, Unset]
        if isinstance(self.params, Unset):
            params = UNSET
        elif isinstance(self.params, ReaderResponseParamsType0):
            params = self.params.to_dict()
        else:
            params = self.params

        name: Union[None, Unset, str]
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        position: Union[None, Unset, str]
        if isinstance(self.position, Unset):
            position = UNSET
        else:
            position = self.position

        direction: Union[None, Unset, str]
        if isinstance(self.direction, Unset):
            direction = UNSET
        elif isinstance(self.direction, ReaderResponseDirectionType0):
            direction = self.direction.value
        else:
            direction = self.direction

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "reader_id": reader_id,
                "owner_id": owner_id,
                "created": created,
                "source": source,
            }
        )
        if params is not UNSET:
            field_dict["params"] = params
        if name is not UNSET:
            field_dict["name"] = name
        if position is not UNSET:
            field_dict["position"] = position
        if direction is not UNSET:
            field_dict["direction"] = direction

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.reader_response_params_type_0 import ReaderResponseParamsType0

        d = src_dict.copy()
        reader_id = d.pop("reader_id")

        owner_id = d.pop("owner_id")

        created = isoparse(d.pop("created"))

        source = d.pop("source")

        def _parse_params(data: object) -> Union["ReaderResponseParamsType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                params_type_0 = ReaderResponseParamsType0.from_dict(data)

                return params_type_0
            except:  # noqa: E722
                pass
            return cast(Union["ReaderResponseParamsType0", None, Unset], data)

        params = _parse_params(d.pop("params", UNSET))

        def _parse_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        name = _parse_name(d.pop("name", UNSET))

        def _parse_position(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        position = _parse_position(d.pop("position", UNSET))

        def _parse_direction(data: object) -> Union[None, ReaderResponseDirectionType0, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                direction_type_0 = ReaderResponseDirectionType0(data)

                return direction_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, ReaderResponseDirectionType0, Unset], data)

        direction = _parse_direction(d.pop("direction", UNSET))

        reader_response = cls(
            reader_id=reader_id,
            owner_id=owner_id,
            created=created,
            source=source,
            params=params,
            name=name,
            position=position,
            direction=direction,
        )

        reader_response.additional_properties = d
        return reader_response

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

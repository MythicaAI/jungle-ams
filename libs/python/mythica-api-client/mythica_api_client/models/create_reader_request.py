from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.create_reader_request_direction import CreateReaderRequestDirection
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.create_reader_request_params_type_0 import CreateReaderRequestParamsType0


T = TypeVar("T", bound="CreateReaderRequest")


@_attrs_define
class CreateReaderRequest:
    """
    Attributes:
        source (str):
        params (Union['CreateReaderRequestParamsType0', None, Unset]):
        name (Union[None, Unset, str]):
        position (Union[None, Unset, str]):
        direction (Union[Unset, CreateReaderRequestDirection]):  Default: CreateReaderRequestDirection.AFTER.
    """

    source: str
    params: Union["CreateReaderRequestParamsType0", None, Unset] = UNSET
    name: Union[None, Unset, str] = UNSET
    position: Union[None, Unset, str] = UNSET
    direction: Union[Unset, CreateReaderRequestDirection] = CreateReaderRequestDirection.AFTER
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.create_reader_request_params_type_0 import CreateReaderRequestParamsType0

        source = self.source

        params: Union[Dict[str, Any], None, Unset]
        if isinstance(self.params, Unset):
            params = UNSET
        elif isinstance(self.params, CreateReaderRequestParamsType0):
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

        direction: Union[Unset, str] = UNSET
        if not isinstance(self.direction, Unset):
            direction = self.direction.value

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
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
        from ..models.create_reader_request_params_type_0 import CreateReaderRequestParamsType0

        d = src_dict.copy()
        source = d.pop("source")

        def _parse_params(data: object) -> Union["CreateReaderRequestParamsType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                params_type_0 = CreateReaderRequestParamsType0.from_dict(data)

                return params_type_0
            except:  # noqa: E722
                pass
            return cast(Union["CreateReaderRequestParamsType0", None, Unset], data)

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

        _direction = d.pop("direction", UNSET)
        direction: Union[Unset, CreateReaderRequestDirection]
        if isinstance(_direction, Unset):
            direction = UNSET
        else:
            direction = CreateReaderRequestDirection(_direction)

        create_reader_request = cls(
            source=source,
            params=params,
            name=name,
            position=position,
            direction=direction,
        )

        create_reader_request.additional_properties = d
        return create_reader_request

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

from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TopologyRefResponse")


@_attrs_define
class TopologyRefResponse:
    """
    Attributes:
        src_id (str):
        dst_id (str):
        edge_data (Union[Any, None, Unset]):
    """

    src_id: str
    dst_id: str
    edge_data: Union[Any, None, Unset] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        src_id = self.src_id

        dst_id = self.dst_id

        edge_data: Union[Any, None, Unset]
        if isinstance(self.edge_data, Unset):
            edge_data = UNSET
        else:
            edge_data = self.edge_data

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "src_id": src_id,
                "dst_id": dst_id,
            }
        )
        if edge_data is not UNSET:
            field_dict["edge_data"] = edge_data

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        src_id = d.pop("src_id")

        dst_id = d.pop("dst_id")

        def _parse_edge_data(data: object) -> Union[Any, None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[Any, None, Unset], data)

        edge_data = _parse_edge_data(d.pop("edge_data", UNSET))

        topology_ref_response = cls(
            src_id=src_id,
            dst_id=dst_id,
            edge_data=edge_data,
        )

        topology_ref_response.additional_properties = d
        return topology_ref_response

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

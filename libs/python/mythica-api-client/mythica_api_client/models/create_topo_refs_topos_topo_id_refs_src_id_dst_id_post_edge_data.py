from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData")


@_attrs_define
class CreateTopoRefsToposTopoIdRefsSrcIdDstIdPostEdgeData:
    """ """

    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        create_topo_refs_topos_topo_id_refs_src_id_dst_id_post_edge_data = cls()

        create_topo_refs_topos_topo_id_refs_src_id_dst_id_post_edge_data.additional_properties = d
        return create_topo_refs_topos_topo_id_refs_src_id_dst_id_post_edge_data

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

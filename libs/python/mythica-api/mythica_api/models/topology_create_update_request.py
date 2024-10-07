from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TopologyCreateUpdateRequest")


@_attrs_define
class TopologyCreateUpdateRequest:
    """
    Attributes:
        name (str):
        org_id (str):
        description (Union[None, Unset, str]):
        edge_data_schema (Union[None, Unset, str]):
    """

    name: str
    org_id: str
    description: Union[None, Unset, str] = UNSET
    edge_data_schema: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        name = self.name

        org_id = self.org_id

        description: Union[None, Unset, str]
        if isinstance(self.description, Unset):
            description = UNSET
        else:
            description = self.description

        edge_data_schema: Union[None, Unset, str]
        if isinstance(self.edge_data_schema, Unset):
            edge_data_schema = UNSET
        else:
            edge_data_schema = self.edge_data_schema

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "name": name,
                "org_id": org_id,
            }
        )
        if description is not UNSET:
            field_dict["description"] = description
        if edge_data_schema is not UNSET:
            field_dict["edge_data_schema"] = edge_data_schema

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        name = d.pop("name")

        org_id = d.pop("org_id")

        def _parse_description(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        description = _parse_description(d.pop("description", UNSET))

        def _parse_edge_data_schema(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        edge_data_schema = _parse_edge_data_schema(d.pop("edge_data_schema", UNSET))

        topology_create_update_request = cls(
            name=name,
            org_id=org_id,
            description=description,
            edge_data_schema=edge_data_schema,
        )

        topology_create_update_request.additional_properties = d
        return topology_create_update_request

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

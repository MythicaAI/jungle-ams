import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.topology_edge_data_schema_type_0 import TopologyEdgeDataSchemaType0


T = TypeVar("T", bound="Topology")


@_attrs_define
class Topology:
    """Provides a grouping for asset graphs

    Attributes:
        topology_seq (int):
        owner_seq (Union[None, int]):
        org_seq (Union[None, int]):
        created (Union[None, Unset, datetime.datetime]):
        updated (Union[None, Unset, datetime.datetime]):
        name (Union[None, Unset, str]):
        description (Union[None, Unset, str]):
        edge_data_schema (Union['TopologyEdgeDataSchemaType0', None, Unset]):
    """

    topology_seq: int
    owner_seq: Union[None, int]
    org_seq: Union[None, int]
    created: Union[None, Unset, datetime.datetime] = UNSET
    updated: Union[None, Unset, datetime.datetime] = UNSET
    name: Union[None, Unset, str] = UNSET
    description: Union[None, Unset, str] = UNSET
    edge_data_schema: Union["TopologyEdgeDataSchemaType0", None, Unset] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.topology_edge_data_schema_type_0 import TopologyEdgeDataSchemaType0

        topology_seq = self.topology_seq

        owner_seq: Union[None, int]
        owner_seq = self.owner_seq

        org_seq: Union[None, int]
        org_seq = self.org_seq

        created: Union[None, Unset, str]
        if isinstance(self.created, Unset):
            created = UNSET
        elif isinstance(self.created, datetime.datetime):
            created = self.created.isoformat()
        else:
            created = self.created

        updated: Union[None, Unset, str]
        if isinstance(self.updated, Unset):
            updated = UNSET
        elif isinstance(self.updated, datetime.datetime):
            updated = self.updated.isoformat()
        else:
            updated = self.updated

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

        edge_data_schema: Union[Dict[str, Any], None, Unset]
        if isinstance(self.edge_data_schema, Unset):
            edge_data_schema = UNSET
        elif isinstance(self.edge_data_schema, TopologyEdgeDataSchemaType0):
            edge_data_schema = self.edge_data_schema.to_dict()
        else:
            edge_data_schema = self.edge_data_schema

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "topology_seq": topology_seq,
                "owner_seq": owner_seq,
                "org_seq": org_seq,
            }
        )
        if created is not UNSET:
            field_dict["created"] = created
        if updated is not UNSET:
            field_dict["updated"] = updated
        if name is not UNSET:
            field_dict["name"] = name
        if description is not UNSET:
            field_dict["description"] = description
        if edge_data_schema is not UNSET:
            field_dict["edge_data_schema"] = edge_data_schema

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.topology_edge_data_schema_type_0 import TopologyEdgeDataSchemaType0

        d = src_dict.copy()
        topology_seq = d.pop("topology_seq")

        def _parse_owner_seq(data: object) -> Union[None, int]:
            if data is None:
                return data
            return cast(Union[None, int], data)

        owner_seq = _parse_owner_seq(d.pop("owner_seq"))

        def _parse_org_seq(data: object) -> Union[None, int]:
            if data is None:
                return data
            return cast(Union[None, int], data)

        org_seq = _parse_org_seq(d.pop("org_seq"))

        def _parse_created(data: object) -> Union[None, Unset, datetime.datetime]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                created_type_0 = isoparse(data)

                return created_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.datetime], data)

        created = _parse_created(d.pop("created", UNSET))

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

        def _parse_edge_data_schema(data: object) -> Union["TopologyEdgeDataSchemaType0", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                edge_data_schema_type_0 = TopologyEdgeDataSchemaType0.from_dict(data)

                return edge_data_schema_type_0
            except:  # noqa: E722
                pass
            return cast(Union["TopologyEdgeDataSchemaType0", None, Unset], data)

        edge_data_schema = _parse_edge_data_schema(d.pop("edge_data_schema", UNSET))

        topology = cls(
            topology_seq=topology_seq,
            owner_seq=owner_seq,
            org_seq=org_seq,
            created=created,
            updated=updated,
            name=name,
            description=description,
            edge_data_schema=edge_data_schema,
        )

        topology.additional_properties = d
        return topology

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

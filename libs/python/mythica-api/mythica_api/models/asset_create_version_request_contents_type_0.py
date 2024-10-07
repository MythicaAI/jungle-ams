from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.asset_version_content import AssetVersionContent


T = TypeVar("T", bound="AssetCreateVersionRequestContentsType0")


@_attrs_define
class AssetCreateVersionRequestContentsType0:
    """ """

    additional_properties: Dict[str, List[Union["AssetVersionContent", str]]] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.asset_version_content import AssetVersionContent

        field_dict: Dict[str, Any] = {}
        for prop_name, prop in self.additional_properties.items():
            field_dict[prop_name] = []
            for additional_property_item_data in prop:
                additional_property_item: Union[Dict[str, Any], str]
                if isinstance(additional_property_item_data, AssetVersionContent):
                    additional_property_item = additional_property_item_data.to_dict()
                else:
                    additional_property_item = additional_property_item_data
                field_dict[prop_name].append(additional_property_item)

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.asset_version_content import AssetVersionContent

        d = src_dict.copy()
        asset_create_version_request_contents_type_0 = cls()

        additional_properties = {}
        for prop_name, prop_dict in d.items():
            additional_property = []
            _additional_property = prop_dict
            for additional_property_item_data in _additional_property:

                def _parse_additional_property_item(data: object) -> Union["AssetVersionContent", str]:
                    try:
                        if not isinstance(data, dict):
                            raise TypeError()
                        additional_property_item_type_0 = AssetVersionContent.from_dict(data)

                        return additional_property_item_type_0
                    except:  # noqa: E722
                        pass
                    return cast(Union["AssetVersionContent", str], data)

                additional_property_item = _parse_additional_property_item(additional_property_item_data)

                additional_property.append(additional_property_item)

            additional_properties[prop_name] = additional_property

        asset_create_version_request_contents_type_0.additional_properties = additional_properties
        return asset_create_version_request_contents_type_0

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> List[Union["AssetVersionContent", str]]:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: List[Union["AssetVersionContent", str]]) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties

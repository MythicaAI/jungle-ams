from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.job_result_model import JobResultModel


T = TypeVar("T", bound="JobResultResponse")


@_attrs_define
class JobResultResponse:
    """
    Attributes:
        completed (bool):
        results (List['JobResultModel']):
    """

    completed: bool
    results: List["JobResultModel"]
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        completed = self.completed

        results = []
        for results_item_data in self.results:
            results_item = results_item_data.to_dict()
            results.append(results_item)

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "completed": completed,
                "results": results,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.job_result_model import JobResultModel

        d = src_dict.copy()
        completed = d.pop("completed")

        results = []
        _results = d.pop("results")
        for results_item_data in _results:
            results_item = JobResultModel.from_dict(results_item_data)

            results.append(results_item)

        job_result_response = cls(
            completed=completed,
            results=results,
        )

        job_result_response.additional_properties = d
        return job_result_response

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

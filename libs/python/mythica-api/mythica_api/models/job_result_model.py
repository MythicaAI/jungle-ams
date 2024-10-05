from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.job_result_model_result_data import JobResultModelResultData


T = TypeVar("T", bound="JobResultModel")


@_attrs_define
class JobResultModel:
    """
    Attributes:
        created_in (str):
        result_data (JobResultModelResultData):
        job_result_id (str):
    """

    created_in: str
    result_data: "JobResultModelResultData"
    job_result_id: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        created_in = self.created_in

        result_data = self.result_data.to_dict()

        job_result_id = self.job_result_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "created_in": created_in,
                "result_data": result_data,
                "job_result_id": job_result_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.job_result_model_result_data import JobResultModelResultData

        d = src_dict.copy()
        created_in = d.pop("created_in")

        result_data = JobResultModelResultData.from_dict(d.pop("result_data"))

        job_result_id = d.pop("job_result_id")

        job_result_model = cls(
            created_in=created_in,
            result_data=result_data,
            job_result_id=job_result_id,
        )

        job_result_model.additional_properties = d
        return job_result_model

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

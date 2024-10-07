from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.job_request_params import JobRequestParams


T = TypeVar("T", bound="JobRequest")


@_attrs_define
class JobRequest:
    """
    Attributes:
        job_def_id (str):
        input_files (List[str]):
        params (JobRequestParams):
    """

    job_def_id: str
    input_files: List[str]
    params: "JobRequestParams"
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        job_def_id = self.job_def_id

        input_files = self.input_files

        params = self.params.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "job_def_id": job_def_id,
                "input_files": input_files,
                "params": params,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.job_request_params import JobRequestParams

        d = src_dict.copy()
        job_def_id = d.pop("job_def_id")

        input_files = cast(List[str], d.pop("input_files"))

        params = JobRequestParams.from_dict(d.pop("params"))

        job_request = cls(
            job_def_id=job_def_id,
            input_files=input_files,
            params=params,
        )

        job_request.additional_properties = d
        return job_request

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

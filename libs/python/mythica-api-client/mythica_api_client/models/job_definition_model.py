from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.job_definition_model_config import JobDefinitionModelConfig
    from ..models.job_definition_model_params_schema import JobDefinitionModelParamsSchema


T = TypeVar("T", bound="JobDefinitionModel")


@_attrs_define
class JobDefinitionModel:
    """
    Attributes:
        job_type (str):
        name (str):
        description (str):
        config (JobDefinitionModelConfig):
        input_files (int):
        params_schema (JobDefinitionModelParamsSchema):
        job_def_id (str):
    """

    job_type: str
    name: str
    description: str
    config: "JobDefinitionModelConfig"
    input_files: int
    params_schema: "JobDefinitionModelParamsSchema"
    job_def_id: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        job_type = self.job_type

        name = self.name

        description = self.description

        config = self.config.to_dict()

        input_files = self.input_files

        params_schema = self.params_schema.to_dict()

        job_def_id = self.job_def_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "job_type": job_type,
                "name": name,
                "description": description,
                "config": config,
                "input_files": input_files,
                "params_schema": params_schema,
                "job_def_id": job_def_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.job_definition_model_config import JobDefinitionModelConfig
        from ..models.job_definition_model_params_schema import JobDefinitionModelParamsSchema

        d = src_dict.copy()
        job_type = d.pop("job_type")

        name = d.pop("name")

        description = d.pop("description")

        config = JobDefinitionModelConfig.from_dict(d.pop("config"))

        input_files = d.pop("input_files")

        params_schema = JobDefinitionModelParamsSchema.from_dict(d.pop("params_schema"))

        job_def_id = d.pop("job_def_id")

        job_definition_model = cls(
            job_type=job_type,
            name=name,
            description=description,
            config=config,
            input_files=input_files,
            params_schema=params_schema,
            job_def_id=job_def_id,
        )

        job_definition_model.additional_properties = d
        return job_definition_model

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

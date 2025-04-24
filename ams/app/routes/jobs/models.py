from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

from ripple.models.assets import AssetVersionEntryPointReference
from ripple.models.params import ParameterSet, ParameterSpec


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    params_schema: ParameterSpec
    source: Optional[AssetVersionEntryPointReference] = None
    interactive: Optional[bool] = False


class JobDefinitionTemplateRequest(BaseModel):
    job_type: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    params_schema: Optional[ParameterSpec] = None
    source: Optional[AssetVersionEntryPointReference] = None


class JobDefinitionResponse(BaseModel):
    job_def_id: str
    interactive: Optional[bool] = False


class JobDefinitionModel(JobDefinitionRequest):
    job_def_id: str
    interactive: Optional[bool] = False
    owner_id: str | None = None


class JobRequest(BaseModel):
    job_def_id: str
    interactive: Optional[bool] = False
    params: ParameterSet


class JobResponse(BaseModel):
    job_id: str
    event_id: str
    job_def_id: str


class JobResultRequest(BaseModel):
    created_in: str
    result_data: dict[str, Any]


class JobResultCreateResponse(BaseModel):
    job_result_id: str


class JobResultModel(JobResultRequest):
    job_result_id: str


class JobResultResponse(BaseModel):
    job_def_id: Optional[str]
    created: datetime
    completed: bool
    results: Optional[list[JobResultModel]]


class ExtendedJobResultResponse(JobResultResponse):
    job_id: str
    completed: Optional[datetime] = None
    params: dict[str, Any]
    input_files: Optional[dict[str, Any]] = None

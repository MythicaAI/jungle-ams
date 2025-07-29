from collections.abc import Callable
from typing import Any, Literal

from pydantic import BaseModel

from meshwork.models.params import (
    FileParameter,
    HoudiniParmTemplateSpecType,
    IntParameterSpec,
    ParameterSet,
)
from meshwork.models.streaming import ProcessStreamItem


class AutomationsResponse(ProcessStreamItem):
    item_type: Literal["automationsReponse"] = "automationsReponse"
    automations: dict[str, dict[Literal["input", "output", "hidden"], Any]]


class AutomationModel(BaseModel):
    path: str
    provider: Callable
    inputModel: type[ParameterSet]
    outputModel: type[ProcessStreamItem]
    interfaceModel: Callable[[], list[HoudiniParmTemplateSpecType]] | None = None
    hidden: bool = False


class AutomationRequest(BaseModel):
    """
    Contract for requests for work, results will be published back to
    results_subject if specified.
    """

    process_guid: str
    correlation: str
    results_subject: str | None = None
    job_id: str | None = None
    auth_token: str | None = None
    path: str
    data: dict
    telemetry_context: dict | None = {}
    event_id: str | None = None


class BulkAutomationRequest(BaseModel):
    """Bulk automation-jobs in one requests"""

    is_bulk_processing: bool = True
    requests: list[AutomationRequest] = []
    event_id: str | None = None
    telemetry_context: dict | None = {}


class AutomationRequestResult(BaseModel):
    processed: bool = False
    request: AutomationRequest | None = None
    result: dict | None = None


class EventAutomationResponse(BaseModel):
    """Bulk automation-jobs in one requests"""

    is_bulk_processing: bool = False
    processed: bool = False
    request_result: list[AutomationRequestResult] = []


class CropImageRequest(ParameterSet):
    image_file: FileParameter
    src_asset_id: str
    src_version: list[int]
    crop_pos_x: IntParameterSpec | None = None
    crop_pos_y: IntParameterSpec | None = None
    crop_w: IntParameterSpec
    crop_h: IntParameterSpec

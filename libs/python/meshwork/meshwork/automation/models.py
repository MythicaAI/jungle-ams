from typing import Any, Callable, Dict, Literal, Optional, Type

from pydantic import BaseModel
from meshwork.models.params import FileParameter, HoudiniParmTemplateSpecType, IntParameterSpec, ParameterSet
from meshwork.models.streaming import ProcessStreamItem


class AutomationsResponse(ProcessStreamItem):
    item_type: Literal["automationsReponse"] = "automationsReponse"
    automations: Dict[str, Dict[Literal["input", "output", "hidden"], Any]]


class AutomationModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[ParameterSet]
    outputModel: Type[ProcessStreamItem]
    interfaceModel: Optional[Callable[[], list[HoudiniParmTemplateSpecType]]] = None
    hidden: bool = False


class AutomationRequest(BaseModel):
    """
    Contract for requests for work, results will be published back to
    results_subject if specified.
    """

    process_guid: str
    correlation: str
    results_subject: Optional[str] = None
    job_id: Optional[str] = None
    auth_token: Optional[str] = None
    path: str
    data: Dict
    telemetry_context: Optional[Dict] = {}
    event_id: Optional[str] = None


class BulkAutomationRequest(BaseModel):
    """Bulk automation-jobs in one requests"""

    is_bulk_processing: bool = True
    requests: list[AutomationRequest] = []
    event_id: Optional[str] = None
    telemetry_context: Optional[Dict] = {}


class AutomationRequestResult(BaseModel):
    processed: bool = False
    request: Optional[AutomationRequest] = None
    result: Optional[Dict] = None


class EventAutomationResponse(BaseModel):
    """Bulk automation-jobs in one requests"""

    is_bulk_processing: bool = False
    processed: bool = False
    request_result: list[AutomationRequestResult] = []


class CropImageRequest(ParameterSet):
    image_file: FileParameter
    src_asset_id: str
    src_version: list[int]
    crop_pos_x: Optional[IntParameterSpec] = None
    crop_pos_y: Optional[IntParameterSpec] = None
    crop_w: IntParameterSpec
    crop_h: IntParameterSpec

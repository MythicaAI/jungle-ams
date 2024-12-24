from ripple.models.params import ParameterSet
from pydantic import BaseModel
from ripple.models.streaming import ProcessStreamItem


from typing import Any, Callable, Dict, Literal, Type, Optional


class AutomationsResponse(ProcessStreamItem):
    item_type: Literal["automationsReponse"] = "automationsReponse"
    automations: Dict[str, Dict[Literal["input", "output", "hidden"],Any]]


class AutomationModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[ParameterSet]
    outputModel: Type[ProcessStreamItem]
    hidden: bool = False


class AutomationRequest(BaseModel):
    """
    Contract for requests for work, results will be published back to
    result subject of the process guid.
    """
    process_guid: str
    work_guid: str
    job_id: Optional[str] = None
    auth_token: Optional[str] = None
    path: str
    data: Dict
    context: Optional[Dict] = {}

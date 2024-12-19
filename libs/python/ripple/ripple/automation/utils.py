from asyncio import Task
from logging import Logger
import traceback

from pydantic import BaseModel
from typing import Any, Literal, Type, Callable, Optional, Dict
from ripple.models.params import ParameterSet
from ripple.models.streaming import ProcessStreamItem

def format_exception(e: Exception) -> str:
    return f" {str(e)}\n{traceback.format_exc()}"

def error_handler(log: Logger) -> callable:
    def handler(task: Task):
        e = task.exception()
        if e:
            log.error(f"Error publishing result: {format_exception(e)}")
    return handler


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



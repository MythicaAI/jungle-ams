import hou
import json
import logging
import mythica.network as mnet
import requests

from ripple.automation import ResultPublisher
from ripple.compile.rpsc import compile_interface
from ripple.models.params import FileParameter, ParameterSet, ParameterSpec, FileParameterSpec, IntParameterSpec, StringParameterSpec
from ripple.models.streaming import JobDefinition, ProcessStreamItem
from typing import Literal

from opentelemetry import trace


tracer = trace.get_tracer(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


def extract_node_type_info(hda_path: str) -> list[dict]:
    hou.hipFile.clear(suppress_save_prompt=True)
    hou.hda.installFile(hda_path, force_use_assets=True)

    result = []
    for assetdef in hou.hda.definitionsInFile(hda_path):
        type = assetdef.nodeType()
        type_info = mnet.get_node_type(type, False)
        result.append(type_info)

    hou.hda.uninstallFile(hda_path)
    hou.hipFile.clear(suppress_save_prompt=True)
    return result


def set_config_params(param_spec: ParameterSpec, hda_file_id: str, index: int):
    param_spec.params['hda_file'] = FileParameterSpec(
        label='HDA File', 
        constant=True, 
        default=hda_file_id
    )
    param_spec.params['hda_definition_index'] = IntParameterSpec(
        label='HDA Definition Index', 
        constant=True, 
        default=index
    )
    param_spec.params['format'] = StringParameterSpec(
        label='Format', 
        default='usdz'
    )

class GenerateJobDefRequest(ParameterSet):
    hda_file: FileParameter

class GenerateJobDefResponse(ProcessStreamItem):
    item_type: Literal["job_defs"] = "job_defs"
    job_definitions: list[JobDefinition]



def generate_job_defs(request: GenerateJobDefRequest, responder: ResultPublisher) -> GenerateJobDefResponse:

    hda_file = request.hda_file

    type_infos = extract_node_type_info(hda_file.file_path)
    ret = []
    for index, type_info in enumerate(type_infos):
        category = type_info['category']
        if category != 'SOP':
            continue

        param_spec = compile_interface(json.dumps(type_info, indent=2))
        set_config_params(param_spec, hda_file.file_id, index)

        res = JobDefinition(
            job_type='houdini::/mythica/generate_mesh',
            name=f"Generate {type_info['name']}",
            description=type_info['description'],
            parameter_spec=param_spec
        )
        ret.append(res)
        responder.result(res)
            
        return GenerateJobDefResponse(job_definitions=ret)


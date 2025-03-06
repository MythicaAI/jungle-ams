import hou as hou_hou
import json
import logging
import mythica.network as mnet
import requests

from types import SimpleNamespace
from ripple.automation.publishers import ResultPublisher
from ripple.compile.rpsc import compile_interface
from ripple.models.params import FileParameter, ParameterSet, ParameterSpec, FileParameterSpec, BoolParameterSpec, IntParameterSpec, StringParameterSpec
from ripple.models.streaming import JobDefinition, ProcessStreamItem
from typing import Literal
from ripple.models import houClasses
from ripple.models import houTypes
from opentelemetry import trace


tracer = trace.get_tracer(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


def extract_node_type_info(hda_path: str) -> list[dict]:
    hou_hou.hipFile.clear(suppress_save_prompt=True)
    hou_hou.hda.installFile(hda_path, force_use_assets=True)

    result = []
    for assetdef in hou_hou.hda.definitionsInFile(hda_path):
        type = assetdef.nodeType()
        type_info = mnet.get_node_type(type)
        result.append(type_info)

    hou_hou.hda.uninstallFile(hda_path)
    hou_hou.hipFile.clear(suppress_save_prompt=True)
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
    param_spec.params['record_profile'] = BoolParameterSpec(
        label='Record Profile', 
        default=False
    )


class JobDefRequest(ParameterSet):
    hda_file: FileParameter
    #src_asset_id: str
    #src_version: list[int]


class JobDefResponse(ProcessStreamItem):
    item_type: Literal["job_defs"] = "job_defs"
    job_definitions: list[JobDefinition]


def job_defs(request: JobDefRequest, responder: ResultPublisher) -> JobDefResponse:

    hda_file = request.hda_file

    type_infos = extract_node_type_info(hda_file.file_path)
    print (type_infos)
    ret = []
    for index, type_info in enumerate(type_infos):
        category = type_info['category']
        if category != 'SOP':
            continue
        nt_python = type_info['code']
        hou_ns = SimpleNamespace()

        # Copy all attributes from houdini and houTypes into hou
        hou_ns.__dict__.update(vars(houClasses))
        hou_ns.__dict__.update(vars(houTypes))

        # Execution context
        context = {"hou": hou_ns}
        scope = {}
        exec(nt_python,context, scope)
        group:houClasses.ParmTemplateGroup = scope.get("hou_parm_template_group")
        

        #set_config_params(group, hda_file.file_id, index)
        source = None
        """
        if len(request.src_asset_id) > 0:
            source = AssetVersionEntryPointReference(
                asset_id=request.src_asset_id,
                major=request.src_version[0],
                minor=request.src_version[1],
                patch=request.src_version[2],
                file_id=hda_file.file_id,
                entry_point=type_info['name']
            )
        """
        
        res = JobDefinition(
            job_type='houdini::/mythica/generate_mesh',
            name=f"Generate {type_info['name']}",
            description=type_info['description'],
            parameter_spec= ParameterSpec(
                params={
                    "base": group.getParameterSpec().params,
                    "houdini": group.getParmTemplateSpec().params,
                }
            ),
            source=source
        )
        ret.append(res)
        responder.result(res)
            
        return JobDefResponse(job_definitions=ret)

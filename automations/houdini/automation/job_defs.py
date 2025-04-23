import hou as hou_hou
import json
import logging
import mythica.network as mnet
import requests

from types import SimpleNamespace
from ripple.automation.publishers import ResultPublisher
from ripple.models.assets import AssetVersionEntryPointReference
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

def gather_dependencies() -> list[str]:
    # TODO: Gather file_id of HDA dependnecies
    return []

def set_config_params(params: ParameterSpec, hda_file_id: str, index: int):
    params['hda_file'] = FileParameterSpec(
        label='HDA File',
        constant=True,
        default=hda_file_id
    )
    params['hda_definition_index'] = IntParameterSpec(
        label='HDA Definition Index',
        constant=True,
        default=index
    )
    params['format'] = StringParameterSpec(
        label='Format',
        default='usdz'
    )
    params['dependencies'] = FileParameterSpec(
        label='Dependencies',
        constant=True,
        default=gather_dependencies()
    )

class JobDefRequest(ParameterSet):
    hda_file: FileParameter
    src_asset_id: str
    src_version: list[int]
    src_package_files: list[FileParameter]

class JobDefResponse(ProcessStreamItem):
    item_type: Literal["job_defs"] = "job_defs"
    job_definitions: list[JobDefinition]


def job_defs(request: JobDefRequest, responder: ResultPublisher) -> JobDefResponse:

    hda_file = request.hda_file

    type_infos = extract_node_type_info(hda_file.file_path)

    ret = []
    for index, type_info in enumerate(type_infos):
        category = type_info['category']
        #Only SOP HDA's supported
        if category != 'SOP':
            continue

        #Parse inputs and convert them to FileParameterSpec
        in_files: dict[str, FileParameterSpec] = {}
        for index, label in enumerate(type_info['inputLabels']):
            name = f'input{index}'
            in_files[name] = FileParameterSpec(label=label, name=name, default='')
        out_files: dict[str, FileParameterSpec] = {}
        for index, label in enumerate(type_info['outputLabels']):
            name = f'output{index}'
            out_files[name] = FileParameterSpec(label=label, name=name, default='')

        #Get parmTemplate definition script
        nt_python = type_info['code']

        #Emulate the hou namespace for the script
        hou_ns = SimpleNamespace()
        hou_ns.__dict__.update(vars(houClasses))
        hou_ns.__dict__.update(vars(houTypes))

        # Create an execution context and exec the script
        context = {"hou": hou_ns}
        scope = {}
        exec(nt_python,context, scope)
        #Grab results
        group:houClasses.ParmTemplateGroup = scope.get("hou_parm_template_group")

        source = None

        if len(request.src_asset_id) > 0:
            source = AssetVersionEntryPointReference(
                asset_id=request.src_asset_id,
                major=request.src_version[0],
                minor=request.src_version[1],
                patch=request.src_version[2],
                file_id=hda_file.file_id,
                entry_point=type_info['name']
            )

        all = group.getParmTemplateSpec()
        params = all.params
        params_v2 = all.params_v2
        params.update(in_files)
        params_v2.extend(in_files.values())
        params_v2.extend(out_files.values())

        set_config_params(params, hda_file.file_id, index)

        res = JobDefinition(
            job_type='houdini::/mythica/generate_mesh',
            name=f"Generate {type_info['name']}",
            description=type_info['description'],
            parameter_spec= ParameterSpec(
                params= params,
                params_v2=params_v2
            ),
            source=source
        )
        ret.append(res)
        responder.result(res)

        return JobDefResponse(job_definitions=ret)

import hou
import json
import logging
import mythica.network as mnet
import requests

from ripple.compile.rpsc import compile_interface
from ripple.models.params import ParameterSet, ParameterSpec, FileParameterSpec, IntParameterSpec, StringParameterSpec
from ripple.models.streaming import JobDefinition
from typing import Optional


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


def extract_node_type_info(hda_path: str) -> list[dict]:
    hou.hda.installFile(hda_path, force_use_assets=True)

    result = []
    for assetdef in hou.hda.definitionsInFile(hda_path):
        type = assetdef.nodeType()
        type_info = mnet.get_node_type(type, False)
        result.append(type_info)

    hou.hda.uninstallFile(hda_path)

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
    ),
    param_spec.params['format'] = StringParameterSpec(
        label='Format', 
        constant=True, 
        default='usdz'
    )


def generate_job_defs(request: ParameterSet, result_callback):
    hda_file = request.params['hda_file']

    type_infos = extract_node_type_info(hda_file.file_path)

    for index, type_info in enumerate(type_infos):
        param_spec = compile_interface(json.dumps(type_info, indent=2))
        set_config_params(param_spec, hda_file.file_id, index)

        result_callback(JobDefinition(
            job_type='houdini::/mythica/generate_mesh',
            name=f"Generate {type_info['name']}",
            description=type_info['description'],
            parameter_spec=param_spec
        ))

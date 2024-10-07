import hou
import logging
import mythica.network as mnet
import requests

from ripple.model import ParameterSet, ParameterSpec, FileParameterSpec
from ripple.runtime import compile_interface
from typing import Optional

#TODO: Configure elsewhere
ENDPOINT = "https://api.mythica.ai/v1"


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
        file_id=hda_file_id
    )
    param_spec.params['hda_definition_index'] = FileParameterSpec(
        label='HDA Definition Index', 
        constant=True, 
        default=index
    )


def publish_job_def(name: str, description: str, param_spec: ParameterSpec) -> Optional[str]:
    definition = {
        'job_type': 'houdini_generate_mesh',
        'name': f"Generate {name}",
        'description': description,
        'params_schema': param_spec.json(),
        'config': {},     #TODO: Remove from request/db schema
        'input_files': 0  #TODO: Remove from request/db schema
    }
    response = requests.post(
        f"{ENDPOINT}/jobs/definitions",
        json=definition, timeout=10)

    if response.status_code != 201:
        log.warning("Failed to create job definition for %s. Status code: %s",
                    name, response.status_code)
        return False
    
    result = response.json()
    job_def_id = result['job_def_id']

    return job_def_id


def generate_job_defs(request: ParameterSet, result_callback):
    hda_file_id = request.params['hda_file'].file_id
    hda_path = request.params['hda_file'].file_path

    type_infos = extract_node_type_info(hda_path)

    for index, type_info in enumerate(type_infos):
        name = type_info['name']
        description = type_info['description']
        param_spec = compile_interface(type_info)

        set_config_params(param_spec, hda_file_id, index)
        job_def_id = publish_job_def(name, description, param_spec)

        if job_def_id is not None:
            result_callback({
                'message': f"Created job definition {job_def_id}"
            })

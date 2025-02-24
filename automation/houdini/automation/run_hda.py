from automation.generate_mesh import generate_mesh_impl
import hou

import tempfile
from typing import Literal
from ripple.automation.publishers import ResultPublisher
from pydantic import BaseModel, Field
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import ProcessStreamItem, OutputFiles
from typing import Any
import mythica.network as mnet
import mythica.parm_transpiler as mpt

from opentelemetry import trace


tracer = trace.get_tracer(__name__)

class NodeType(BaseModel):
    root: bool
    subnet: str
    help: str
    icon: str
    inputs: int
    outputs: int
    code: str
    category: str
    namespace: str
    name: str
    version: str
    type: str
    description: str    

class HdaRequest(ParameterSet):
    hdas: list[FileParameter]

class HdaResponse(ProcessStreamItem):
    item_type: Literal["resp"] = "resp"
    node_types: list[NodeType]

def hda(request: HdaRequest, responder: ResultPublisher) -> HdaResponse:
    obj = hou.node('obj')

    nodeTypes = []

    for hda in request.hdas:    
        hou.hda.installFile(hda.file_path, force_use_assets=True)
        # Create a temporary directory
        for assetdef in hou.hda.definitionsInFile(hda.file_path):
            # Get the node type for the asset
            nodeType = mnet.get_node_type(assetdef.nodeType())

            # Generate litegraph class in the temp directory
            nodeType['code'] = mpt.transpiler(nodeType['code'])
            del(nodeType['defaults'])
            # Add the file path to the hdadef array
            nodeTypes.append(nodeType)

        # Uninstall the HDA file after processing
        hou.hda.uninstallFile(hda.file_path)


    return HdaResponse(node_types=nodeTypes) 


class RunHdaRequest(ParameterSet):
    hda_file: FileParameter

class RunHdaResponse(OutputFiles):
    pass

def run_hda(request: RunHdaRequest, responder: ResultPublisher) -> RunHdaResponse:
    
    tmp_dir = tempfile.mkdtemp()
    result_file_paths = generate_mesh_impl(
        request.hda_file.file_path,
        0,
        'usdz',
        request.model_dump(exclude={'hda_file'}),
        tmp_dir,
        responder
    )

    files = {}
    for index in range(len(result_file_paths)):
        files[f'output{index}'] = [result_file_paths[index]]
    return OutputFiles(
        files = files
    )
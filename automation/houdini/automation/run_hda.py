import hou

import tempfile
from typing import Literal
from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import ProcessStreamItem, OutputFiles
import mythica.network as mnet
import mythica.parm_transpiler as mpt

class RunHdaRequest(ParameterSet):
    hdas: list[FileParameter]

class RunHdaResponse(ProcessStreamItem):
    item_type: Literal["resp"] = "resp"
    node_types: list[str] 

def run_hda(request: RunHdaRequest, responder: ResultPublisher) -> RunHdaResponse:
    obj = hou.node('obj')

    nodeTypes = []

    for hda in request.hdas:    
        hou.hda.installFile(hda.file_path, force_use_assets=True)
        # Create a temporary directory
        tmpdirname = tempfile.mkdtemp()
        for assetdef in hou.hda.definitionsInFile(hda.file_path):
            # Get the node type for the asset
            nodeType = mnet.get_node_type(assetdef.nodeType())

            # Generate litegraph class in the temp directory
            nodeType['code'] = mpt.transpiler(nodeType['code'])
            
            # Add the file path to the hdadef array
            nodeTypes.append(nodeType)

        # Uninstall the HDA file after processing
        hou.hda.uninstallFile(hda.file_path)

    return RunHdaResponse(node_types=nodeTypes) 

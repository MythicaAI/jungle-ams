import hou
from pydantic import BaseModel, Field
from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import ProcessStreamItem, OutputFiles
import mythica.darol as mdarol
import mythica.network as mnet
import tempfile
import os
import json

class RequestModel(ParameterSet):
  hdancs: list[FileParameter]

class ResponseModel(OutputFiles):
  files: dict[str, list[str]] = Field(default={
    "networkjson": [],
    "hdajson":[]
  })

def runAutomation(request: RequestModel, responder: ResultPublisher) -> ResponseModel:
  hdadef = []
  netdef = [] 
  obj = hou.node('obj')

  for hdanc in request.hdancs:    
    hou.hda.installFile(hdanc.file_path, force_use_assets=True)
    for assetdef in hou.hda.definitionsInFile(hdanc.file_path):
      #get the node type for the asset
      nodeType = assetdef.nodeType()

      #create an appropriate container for it
      container = mdarol.create_container_for_nodetype(nodeType,obj)

      #now create the asset and cook it
      asset = container.createNode(assetdef.nodeTypeName())
      asset.moveToGoodPosition()
      asset.cook() 

      #Generate network for the HDA asset. 
      net = mnet.get_network(
        hou.node('/'), 
        traverse_subnet=True, 
        traverse_hda=True
      )

      hda_def = mnet.get_hda_definition(assetdef)

      tmpdirname = tempfile.mkdtemp()
      (_,file_name) = os.path.split(hdanc.file_path)
      net_file_name = os.path.join(tmpdirname,f"{file_name}.{asset.name()}.network.json")
      with open(net_file_name, "w", encoding="utf-8") as file:
        file.write(net)
      netdef.append(file_name)
      hda_file_name = os.path.join(tmpdirname,f"{file_name}.{asset.name()}.hda.json")
      with open(hda_file_name, "w", encoding="utf-8") as file:
        file.write(json.dumps(hda_def, indent=2))
      hdadef.append(file_name)
      
    
    hou.hda.uninstallFile(hdanc.file_path)

  return ResponseModel(files={
    "networkjson": netdef,
    "hdajson": hdadef
  })

    
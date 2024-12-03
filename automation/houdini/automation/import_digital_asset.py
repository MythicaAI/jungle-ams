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
  netjsons: list[FileParameter]
  hdajsons: list[FileParameter]

class ResponseModel(OutputFiles):
  files: dict[str, list[str]] = Field(default={"hdas": []})


def runAutomation(request: RequestModel, responder: ResultPublisher) -> ResponseModel:
  result = []
  obj = hou.node('obj')

  index = 0
  
  tmpdir = tempfile.mkdtemp()
    
  for hda in request.hdajsons:
    network = request.netjsons[index]
    hou.hipFile.clear(suppress_save_prompt=True)    
    with open(hda.file_path, 'r', encoding='utf-8') as file:
        hda_contents = json.loads(file.read())

    with open(network.file_path, 'r', encoding='utf-8') as file:
        net_contents = json.loads(file.read())
    mnet.create_network(net_contents, None)
    tmpfile = os.path.join(tmpdir, f"{hda_contents['file_name'].replace('hdanc','hda')}")
    mnet.create_hda(obj.children()[0].children()[0],mnet.HDADefinition(**hda_contents),tmpfile)

    result.append(tmpfile)

  return ResponseModel(files={"hdas": result})

    
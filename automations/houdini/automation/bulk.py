from pydantic import BaseModel, Field
from ripple.automation.publishers import ResultPublisher
from automation.generate_mesh import generate_mesh_impl
from ripple.models.params import ParameterSet, FileParameter, EnumParameterSpec, EnumValueSpec
from ripple.models.streaming import ProcessStreamItem, OutputFiles
import tempfile
import os  # Add import for os module

example={
    "param_type": "enum",
    "label": "Preset",
    "category_label": "", 
    "constant": False,
    "values": [
        {"name": "1","label": "Preset 1"},
        {"name": "2","label": "Preset 2"},
        {"name": "3","label": "Preset 3"}
    ], 
    "default": "1"
},

class RequestModel(ParameterSet):
  hda: FileParameter
  inputFiles: list[FileParameter]
  textureMap: FileParameter
  preset: EnumParameterSpec = example
  

class ResponseModel(OutputFiles):
  files: dict[str, list[str]] = Field(default={"Files": []})
  
class ParmModel(BaseModel):
  input0: FileParameter
  filename: FileParameter

def runAutomation(request: RequestModel, responder: ResultPublisher) -> ResponseModel:
  files = {'Files': []}  # Initialize with empty list
  print(request)
    
  for inputIndex in range(len(request.inputFiles)):
    file = request.inputFiles[inputIndex]
    params= ParmModel(
      input0=file,
      filename=request.textureMap
    )

    tmp_dir = tempfile.mkdtemp()
    result_file_paths = generate_mesh_impl(
        request.hda.file_path,
        0,
        'glb',
        params.model_dump(),
        tmp_dir,
        responder
    )
    for index in range(len(result_file_paths)):
        original_path = result_file_paths[index]
        base, ext = os.path.splitext(original_path)
        new_path = f"{base}_{inputIndex}{ext}"
        os.rename(original_path, new_path)
        files['Files'].append(new_path)
  
  return OutputFiles(
      files = files
  )


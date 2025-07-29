from pydantic import BaseModel, Field
from meshwork.automation.publishers import ResultPublisher
from meshwork.models.params import ParameterSet, FileParameter
from meshwork.models.streaming import ProcessStreamItem, OutputFiles
import bpy
import os


class RequestModel(ParameterSet):
    # List of files to be converted
    files: list[FileParameter]
    # Export as binary GLB if True, else as JSON glTF
    binary: bool = True


class ResponseModel(OutputFiles):
    files: dict[str, list[str]] = Field(default_factory=lambda: {"Files": []})


def clear_scene():
    # Reset Blender's scene to default settings.
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_file(filepath: str):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif ext == '.obj':
        bpy.ops.import_scene.obj(filepath=filepath)
    elif ext in ['.gltf', '.glb']:
        bpy.ops.import_scene.gltf(filepath=filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def export_to_gltf(output_path: str, binary: bool = True):
    export_format = 'GLB' if binary else 'GLTF'
    bpy.ops.export_scene.gltf(filepath=output_path, export_format=export_format)


def convert(filepath: str, binary: bool = True) -> str:
    clear_scene()
    import_file(filepath)
    base, _ = os.path.splitext(filepath)
    ext = '.glb' if binary else '.gltf'
    output_path = f"{base}_converted{ext}"
    export_to_gltf(output_path, binary)
    return output_path


def runAutomation(request: RequestModel, responder: ResultPublisher) -> ResponseModel:
    response = ResponseModel()
    for file_param in request.files:
        filepath = file_param.value  # assuming FileParameter.value is the file path
        if not os.path.exists(filepath):
            responder.publish(ProcessStreamItem(message=f"File not found: {filepath}", level="error"))
            continue
        try:
            output_file = convert(filepath, request.binary)
            response.files["Files"].append(output_file)
            responder.publish(ProcessStreamItem(message=f"Converted {filepath} to {output_file}", level="info"))
        except Exception as e:
            responder.publish(ProcessStreamItem(message=f"Error converting {filepath}: {str(e)}", level="error"))
    return response

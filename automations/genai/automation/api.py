from pydantic import Field
import requests
from ripple.models.streaming import ProcessStreamItem, OutputFiles
from ripple.automation.publishers import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter, StringParmTemplateSpec, FloatParmTemplateSpec, IntParmTemplateSpec, MenuParmTemplateSpec, ToggleParmTemplateSpec
from ripple.models import houTypes as hou
from typing import Literal

import os
from enum import Enum

class ColorToNormalsOverlap(str, Enum):
    """
    Enum representing different overlap types for color to normals processing.
    """
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"

class NormalsToCurvatureBlurRadius(str, Enum):
    """
    Enum representing different blur radius types for normals to curvature processing.
    """
    SMALLEST = "SMALLEST"
    SMALLER = "SMALLER"
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"
    LARGER = "LARGER"
    LARGEST = "LARGEST"

class LowresToHighresScaleFactor(str, Enum):
    """
    Enum representing different scale factors for lowres to highres processing.
    """
    X1 = False
    X2 = "x2"
    X4 = "x4"


class GenericApiRequest(ParameterSet):
    api_endpoint: str
    accept: str = "application/json"
    timeout: int = 60

class ApiResponse(OutputFiles):
    """
    A file output event for generated files, the outputs are keyed
    with a param name.
    """
    item_type: Literal["file"] = "file"
    files: dict[Literal["output"], list[str]]



def generic_material_interface():
    return [
        StringParmTemplateSpec(name="accept", label="Accept Header", help="The value for the Accept header in the request.", default_value=["application/x-www-form-urlencoded"], is_hidden=True),
        IntParmTemplateSpec(name="delight_luminance_min", label="Delight Luminance Min", help="The minimum luminance for delight processing.", default_value=[75], as_scalar=True),
        IntParmTemplateSpec(name="delight_luminance_max", label="Delight Luminance Max", help="The maximum luminance for delight processing.", default_value=[190], as_scalar=True),
        FloatParmTemplateSpec(name="delight_blur_sigma", label="Delight Blur Sigma", help="The sigma value for the blur in delight processing.", default_value=[2.0], as_scalar=True),
        FloatParmTemplateSpec(name="delight_detail_weight", label="Delight Detail Weight", help="The weight for detail in delight processing.", default_value=[0.6], as_scalar=True),
        MenuParmTemplateSpec(
            name="color_to_normals_overlap", 
            label="Color to Normals Overlap", 
            help="The overlap type for color to normals processing.", 
            default_value=ColorToNormalsOverlap.LARGE.value,
            menu_items=[item.value for item in ColorToNormalsOverlap],
            menu_labels=[item.name for item in ColorToNormalsOverlap],
            store_default_value_as_string=True,
        ),
        MenuParmTemplateSpec(
            name="normals_to_curvature_blur_radius", 
            label="Normals to Curvature Blur Radius", 
            help="The blur radius type for normals to curvature processing.", 
            default_value=NormalsToCurvatureBlurRadius.MEDIUM.value,
            menu_items=[item.value for item in NormalsToCurvatureBlurRadius],
            menu_labels=[item.name for item in NormalsToCurvatureBlurRadius],
            store_default_value_as_string=True,
        ),
        ToggleParmTemplateSpec(
            name="normals_to_height_seamless",
            label="Normals to Height Seamless",
            help="Whether the normals to height processing is seamless.",
            default_value=False,
        ),
        MenuParmTemplateSpec(
            name="lowres_to_highres_scale_factor",
            label="Lowres to Highres Scale Factor",
            help="The scale factor for lowres to highres processing.",
            default_value=LowresToHighresScaleFactor.X1.value,
            menu_items=[item.value for item in LowresToHighresScaleFactor],
            menu_labels=[item.name for item in LowresToHighresScaleFactor],
            store_default_value_as_string=True,
        ),
    ]

def text_2_material_interface():
    return generic_material_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("IMAGE_2_MATERIAL_API", "http://54.82.234.239:5555/text_2_material")]),
        StringParmTemplateSpec(name="prompt", label="Prompt", help="The text prompt for the API request.", default_value=[""]),
        StringParmTemplateSpec(name="negative_prompt", label="Negative Prompt", help="The negative text prompt for the API request.", default_value=[""]),
        FloatParmTemplateSpec(name="guidance_scale", label="Guidance Scale", help="The guidance scale for the API request.", default_value=[3.0]),
        IntParmTemplateSpec(name="num_inference_steps", label="Number of Inference Steps", help="The number of inference steps for the API request.", default_value=[8]),
        IntParmTemplateSpec(name="max_sequence_length", label="Max Sequence Length", help="The maximum sequence length for the API request.", default_value=[256]),
    ]

def image_2_material_interface():
    return generic_material_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("IMAGE_2_MATERIAL_API", "http://54.82.234.239:5555/image_2_material")]),
    ]
class Text2MaterialRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_MATERIAL_API", "http://54.82.234.239:5555/text_2_material")
    accept: str = "application/x-www-form-urlencoded"
    prompt: str
    negative_prompt: str = ""
    guidance_scale: float = 3.0
    num_inference_steps: int = 8
    max_sequence_length: int = 256
    delight_luminance_min: int = 75
    delight_luminance_max: int = 190
    delight_blur_sigma: float  = 2
    delight_detail_weight: float = 0.6
    color_to_normals_overlap: ColorToNormalsOverlap =ColorToNormalsOverlap.LARGE
    normals_to_curvature_blur_radius: NormalsToCurvatureBlurRadius = NormalsToCurvatureBlurRadius.MEDIUM
    normals_to_height_seamless: bool = False
    lowres_to_highres_scale_factor: LowresToHighresScaleFactor =LowresToHighresScaleFactor.X1

class Image2MaterialRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("IMAGE_2_MATERIAL_API", "http://54.82.234.239:5555/image_2_material")
    accept: str = "application/x-www-form-urlencoded"
    image: FileParameter
    delight_luminance_min: int = 75
    delight_luminance_max: int = 190
    delight_blur_sigma: float  = 2
    delight_detail_weight: float = 0.6
    color_to_normals_overlap: ColorToNormalsOverlap =ColorToNormalsOverlap.LARGE
    normals_to_curvature_blur_radius: NormalsToCurvatureBlurRadius = NormalsToCurvatureBlurRadius.MEDIUM
    normals_to_height_seamless: bool = False
    lowres_to_highres_scale_factor: LowresToHighresScaleFactor =LowresToHighresScaleFactor.X1


def generic_3d_interface():
    return [
        StringParmTemplateSpec(name="accept", label="Accept Header", help="The value for the Accept header in the request.", default_value=["application/x-www-form-urlencoded"], is_hidden=True),
        IntParmTemplateSpec(name="seed", label="Seed", help="The seed for the random number generator.", default_value=[1], as_scalar=True),
        FloatParmTemplateSpec(name="simplify", label="Simplify", help="The simplification factor for the 3D model.", default_value=[0.95], as_scalar=True),
        IntParmTemplateSpec(name="texture_size", label="Texture Size", help="The size of the texture for the 3D model.", default_value=[1024], as_scalar=True),
        MenuParmTemplateSpec(
            name="return_type",
            label="Return Type",
            help="The type of 3D model to return.",
            default_value="glb",
            menu_items=["glb", "gaussian"],
            menu_labels=["GLB", "Gaussian"],
            store_default_value_as_string=True,
        ),
        IntParmTemplateSpec(name="slat_sampler_params_steps", label="SLAT Sampler Steps", help="The number of steps for the SLAT sampler.", default_value=[12], as_scalar=True),
        FloatParmTemplateSpec(name="slat_sampler_params_cfg_strength", label="SLAT Sampler CFG Strength", help="The CFG strength for the SLAT sampler.", default_value=[3.0], as_scalar=True),
    ]

def text_2_three_d_interface():
    return generic_3d_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/text_2_3d")]),
        StringParmTemplateSpec(name="prompt", label="Prompt", help="The text prompt for the API request.", default_value=[""]),
    ]

def three_d_2_three_d_interface():
    return generic_3d_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/3d_to_3d")]),
        StringParmTemplateSpec(name="prompt", label="Prompt", help="The text prompt for the API request.", default_value=[""]),
    ]

def image_2_three_d_interface():
    return generic_3d_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("IMAGE_2_3D_API", "http://52.86.105.54:5555/image_2_3d")]),
        IntParmTemplateSpec(name="sparse_structure_sampler_params_steps", label="Sparse Structure Sampler Steps", help="The number of steps for the sparse structure sampler.", default_value=[12], as_scalar=True),
        FloatParmTemplateSpec(name="sparse_structure_sampler_params_cfg_strength", label="Sparse Structure Sampler CFG Strength", help="The CFG strength for the sparse structure sampler.", default_value=[7.5], as_scalar=True),
    ]

def multi_image_2_three_d_interface():
    return generic_3d_interface() + [
        StringParmTemplateSpec(name="api_endpoint", label="API Endpoint", help="The API endpoint for the request.", default_value=[os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/multi_image_2_3d")]),
        IntParmTemplateSpec(name="sparse_structure_sampler_params_steps", label="Sparse Structure Sampler Steps", help="The number of steps for the sparse structure sampler.", default_value=[12], as_scalar=True),
        FloatParmTemplateSpec(name="sparse_structure_sampler_params_cfg_strength", label="Sparse Structure Sampler CFG Strength", help="The CFG strength for the sparse structure sampler.", default_value=[7.5], as_scalar=True),
    ]

class Text2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/text_to_3d") 
    accept: str = "application/x-www-form-urlencoded"
    prompt: str
    seed: int= 1
    simplify:  float = 0.95
    texture_size: int = 1024
    return_type: Literal["glb", "gaussian"] = "glb"
    slat_sampler_params_steps: int = 12
    slat_sampler_params_cfg_strength: float = 3.0

class ThreeD2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/3d_to_3d") 
    accept: str = "application/x-www-form-urlencoded"
    base_mesh: FileParameter
    prompt: str
    seed: int= 1
    simplify:  float = 0.95
    texture_size: int = 1024
    return_type: Literal["glb", "gaussian"] = "glb"
    slat_sampler_params_steps: int = 12
    slat_sampler_params_cfg_strength: float = 3.0

class Image2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/image_to_3d") 
    accept: str = "application/x-www-form-urlencoded"
    image: FileParameter
    seed: int= 1
    simplify:  float = 0.95
    texture_size: int = 1024
    return_type: Literal["glb", "gaussian"] = "glb"
    sparse_structure_sampler_params_steps: int = 12
    sparse_structure_sampler_params_cfg_strength: float = 7.5    
    slat_sampler_params_steps: int = 12
    slat_sampler_params_cfg_strength: float = 3.0

class MultiImage2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://52.86.105.54:5555/multi_image_to_3d") 
    accept: str = "application/x-www-form-urlencoded"
    images: list[FileParameter]
    prompt: str
    seed: int= 1
    simplify:  float = 0.95
    texture_size: int = 1024
    return_type: Literal["glb", "gaussian"] = "glb"
    sparse_structure_sampler_params_steps: int = 12
    sparse_structure_sampler_params_cfg_strength: float = 7.5    
    slat_sampler_params_steps: int = 12
    slat_sampler_params_cfg_strength: float = 3.0

def api_request(request: GenericApiRequest, responder: ResultPublisher) -> ApiResponse:
    # Validate that accept is (application/json or application/x-www-form-urlencoded)
    if request.accept not in ["application/json", "application/x-www-form-urlencoded"]:
        raise ValueError("Backend error. `Accept` must be either application/json or application/x-www-form-urlencoded")
    
    if request.accept == "application/x-www-form-urlencoded":
        # Prepare form fields and files
        raw = request.model_dump()
        form_data = {}
        files = {}
        for k, v in raw.items():
            print(f"key: {k}, value: {v}")
            if k == "api_endpoint":
                continue
            # single file
            if isinstance(v, dict) and 'file_path' in v:
                fpath = v['file_path']
                print(f"key: {k}, value: {fpath}")
                files[k] = open(fpath, "rb")
            # list of files
            elif isinstance(v, list) and v and isinstance(v[0], dict) and 'file_path' in v[0]:
                for idx, fp in enumerate(v):
                    fpath = fp['file_path']
                    print(f"key: {k}, value: {fpath}")
                    files[f"{k}[{idx}]"] = open(fpath, "rb")
            else:
                form_data[k] = v
        try:
            response = requests.post(
                request.api_endpoint,
                data=form_data,
                files=files,
                timeout=request.timeout,
            )
        finally:
            for f in files.values():
                f.close()
    else:
        # Send the request
        response = requests.post(request.api_endpoint, json=request.model_dump_json())
    
    if response.status_code == 200:
        # Try to get filename from Content-Disposition header
        filename = None
        content_disposition = response.headers.get('Content-Disposition')
        if content_disposition:
            import re
            filename_match = re.search(r'filename="?([^"]+)"?', content_disposition)
            if filename_match:
                filename = filename_match.group(1)
        
        # If no filename found, create one based on content type
        if not filename:
            content_type = response.headers.get('Content-Type', 'application/octet-stream')
            ext = {
                'application/json': '.json',
                'image/png': '.png',
                'image/jpeg': '.jpg',
                'application/zip': '.zip',
                'text/plain': '.txt',
                # Add more mappings as needed
            }.get(content_type.split(';')[0], '.bin')
            filename = f"output_file{ext}"
        
        # Save the response content to a file
        output_file_path = os.path.join(os.getcwd(), filename)
        with open(output_file_path, "wb") as f:
            f.write(response.content)
        
        # Return the file path with a key based on filename without extension
        return ApiResponse(files={'output': [output_file_path]})
    else:
        raise ValueError(f"Backend error. {response.status_code}: {response.text}")

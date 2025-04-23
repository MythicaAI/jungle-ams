from pydantic import Field
import requests
from ripple.models.streaming import ProcessStreamItem, OutputFiles
from ripple.automation.publishers import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
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

class Text2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://http://52.86.105.54:5555/text_2_3d") 
    accept: str = "application/x-www-form-urlencoded"
    prompt: str
    seed: int= 1
    simplify:  float = 0.95
    texture_size: int = 1024
    return_type: Literal["glb", "gaussian"] = "glb"
    slat_sampler_params_steps: int = 12
    slat_sampler_params_cfg_strength: float = 3.0


class ThreeD2ThreeDRequest(GenericApiRequest):
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://http://52.86.105.54:5555/3d_2_3d") 
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
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://http://52.86.105.54:5555/image_2_3d") 
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
    api_endpoint: str = os.getenv("TEXT_2_3D_API", "http://http://52.86.105.54:5555/multi_image_2_3d") 
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
        # Convert the request to form data
        form_data = {k: v for k, v in request.dict().items() if k != "api_endpoint"}
        # Send the request
        response = requests.post(
            request.api_endpoint, 
            data=form_data,
            timeout=request.timeout)
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

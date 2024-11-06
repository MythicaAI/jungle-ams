from pydantic import BaseModel
from ripple.models.streaming import Progress, OutputFiles
from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet

from typing import List
import torch
from PIL import Image
from torchvision import transforms
from automation.helpers.sd2_differential_diffusion_pipe import StableDiffusionDiffImg2ImgPipeline
from io import BytesIO
import base64
import tempfile
import os
from uuid import uuid4

device = "cuda"

#This is the default model, you can use other fine tuned models as well
sd2_pipe = StableDiffusionDiffImg2ImgPipeline.from_pretrained("stabilityai/stable-diffusion-2-1-base",
                                                          torch_dtype=torch.float16)
sd2_pipe.enable_model_cpu_offload()

#if torch.cuda.is_available():
#    sd2_pipe = sd2_pipe.to(device)

def preprocess_image(image):
    image = image.convert("RGB")
    image = transforms.CenterCrop((image.size[1] // 64 * 64, image.size[0] // 64 * 64))(image)
    image = transforms.ToTensor()(image)
    image = image * 2 - 1
    image = image.unsqueeze(0).to(device)
    return image


def preprocess_map(map):
    map = map.convert("L")
    map = transforms.CenterCrop((map.size[1] // 64 * 64, map.size[0] // 64 * 64))(map)
    # convert to tensor
    map = transforms.ToTensor()(map)
    map = map.to(device)
    return map

class InpaintRequest(ParameterSet):
    prompt: List[str] = []
    negative_prompt: List[str] = []
    guidance_scale: float = 7.0
    num_inference_steps: int = 50
    num_images_per_prompt: int = 1
    image: str #Base64 encoded byte string
    map: str #Base64 encoded byte string
    

def img2img_inpaint(request: InpaintRequest, responder: ResultPublisher) -> OutputFiles:
    try:

        # Decode image from base64
        image_data = base64.b64decode(request.image)
        map_data = base64.b64decode(request.map)

        # Open image and map using PIL
        image = Image.open(BytesIO(image_data))
        map = Image.open(BytesIO(map_data))

        # Preprocess the images
        image = preprocess_image(image)
        map = preprocess_map(map)

        # Get additional parameters
        prompt = request.prompt
        negative_prompt = request.negative_prompt
        guidance_scale = request.guidance_scale
        num_inference_steps = request.num_inference_steps
        num_images_per_prompt = request.num_images_per_prompt

        responder.result(Progress(progress=10))

        # Run the pipeline and get the list of images
        images = sd2_pipe(
            prompt=prompt,
            image=image,
            guidance_scale=guidance_scale,
            num_images_per_prompt=num_images_per_prompt,
            negative_prompt=negative_prompt,
            map=map,
            num_inference_steps=num_inference_steps
        ).images

        responder.result(Progress(progress=80))

        # Use a temporary directory to save all the images
        with tempfile.TemporaryDirectory() as tmpdirname:
            image_files = []
            for img in images:
                # Generate a unique file ID and path for each image
                file_id = str(uuid4())
                filename = f"{file_id}.png"
                file_path = os.path.join(tmpdirname, filename)

                # Save the image to the temporary directory
                img.save(file_path, format="PNG")

                # Add the file_id and path to the dictionary
                image_files.append(file_path)

            responder.result(Progress(progress=90))

            return OutputFiles(files={'image':image_files})

    
    except Exception as e:
        raise e

    finally:
        # Clear CUDA memory
        torch.cuda.empty_cache()

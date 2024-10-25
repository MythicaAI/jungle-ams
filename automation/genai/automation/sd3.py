from pydantic import BaseModel
from diffusers import StableDiffusion3Pipeline
from ripple.models.streaming import Progress, OutputFiles
from ripple.models.params import ParameterSet
from ripple.automation import ResultPublisher

import torch
import io
import base64
import tempfile
import os
from uuid import uuid4


device = "cuda" if torch.cuda.is_available() else "cpu"

# Load the Stable Diffusion model
pipe = StableDiffusion3Pipeline.from_pretrained(
    "stabilityai/stable-diffusion-3-medium-diffusers", 
    text_encoder_3=None,
    tokenizer_3=None,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
).to(device)

if False and device == "cuda":        

    torch._inductor.config.conv_1x1_as_mm = True
    torch._inductor.config.coordinate_descent_tuning = True
    torch._inductor.config.epilogue_fusion = False
    torch._inductor.config.coordinate_descent_check_all_directions = True

    pipe.transformer.to(memory_format=torch.channels_last)
    pipe.vae.to(memory_format=torch.channels_last)
    pipe.transformer = torch.compile(pipe.transformer, mode="max-autotune", fullgraph=True)
    pipe.vae.decode = torch.compile(pipe.vae.decode, mode="max-autotune", fullgraph=True)


# Aspect ratio to width and height mapping
aspect_ratio_mapping = {
    "1:1": (1024, 1024),
    "16:9": (1344, 768),
    "9:16": (768, 1344),
    "5:4": (1150, 920),
    "4:5": (920, 1150),
    "3:2": (1216, 832),
    "2:3": (832, 1216)
}

class ImageRequest(ParameterSet):
    prompt: str
    negative_prompt: str = ""
    steps: int = 28
    cfg_scale: float = 7.0
    aspect_ratio: str = "1:1"
    seed: int = 0

def txt2img(request: ImageRequest, responder: ResultPublisher):
    try:
        prompt = request.prompt
        negative_prompt = request.negative_prompt
        num_inference_steps = request.steps
        guidance_scale = request.cfg_scale
        aspect_ratio = request.aspect_ratio
        seed = request.seed

        responder.result(Progress(progress=10))

        # Get width and height from aspect_ratio
        if aspect_ratio in aspect_ratio_mapping:
            width, height = aspect_ratio_mapping[aspect_ratio]
        else:
            raise Exception("Invalid aspect ratio")

        # Generate the image with the given width and height
        images = pipe(
            prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height
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

            responder.result(OutputFiles(files={'image':image_files}))


    except Exception as e:
        raise e

    finally:
        # Clear CUDA memory
        torch.cuda.empty_cache()


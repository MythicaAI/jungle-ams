from pydantic import BaseModel
from diffusers import StableDiffusion3Pipeline
from ripple.models.streaming import Message
import torch
import io
import base64


# Load the Stable Diffusion model
pipe = StableDiffusion3Pipeline.from_pretrained("stabilityai/stable-diffusion-3-medium-diffusers", torch_dtype=torch.float16)
pipe.enable_model_cpu_offload()
#pipe = pipe.to("cuda")
        
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

class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    steps: int = 28
    cfg_scale: float = 7.0
    aspect_ratio: str = "1:1"
    seed: int = 0





def txt2img(request: ImageRequest, progress: callable):
    try:
        prompt = request.prompt
        negative_prompt = request.negative_prompt
        num_inference_steps = request.steps
        guidance_scale = request.cfg_scale
        aspect_ratio = request.aspect_ratio
        seed = request.seed

        progress(Message(message=f"Starting Txt 2 Image Generation using SD3 Medium: {request}"))

        # Get width and height from aspect_ratio
        if aspect_ratio in aspect_ratio_mapping:
            width, height = aspect_ratio_mapping[aspect_ratio]
        else:
            raise Exception("Invalid aspect ratio")

        # Generate the image with the given width and height
        image = pipe(
            prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height
        ).images[0]
        
        progress(Message(message=f"Txt 2 Image Generation Completed: {request}"))


        # Convert image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        progress(Message(message=f"image: {img_str}"))


    except Exception as e:
        raise e

    finally:
        # Clear CUDA memory
        torch.cuda.empty_cache()


from pydantic import BaseModel
from ripple.models.streaming import Message

from typing import List
import torch
from PIL import Image
from torchvision import transforms
from automation.helpers.sd2_differential_diffusion_pipe import StableDiffusionDiffImg2ImgPipeline
from io import BytesIO
import base64


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

class InpaintRequest(BaseModel):
    prompt: List[str] = []
    negative_prompt: List[str] = []
    guidance_scale: float = 7.0
    num_inference_steps: int = 50
    num_images_per_prompt: int = 1
    image: str #Base64 encoded byte string
    map: str #Base64 encoded byte string
    

def img2img_inpaint(request: InpaintRequest, progress: callable):
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
        

        progress(Message(message=f"Starting Txt 2 Image Inpaint using SD2: {request}"))

        # Run the pipeline
        edited_image = sd2_pipe(
            prompt=prompt,
            image=image,
            guidance_scale=guidance_scale,
            num_images_per_prompt=num_images_per_prompt,
            negative_prompt=negative_prompt,
            map=map,
            num_inference_steps=num_inference_steps
        ).images[0]

        progress(Message(message=f"Txt 2 Image Inpaint completed: {request}"))

        # Convert the edited image to base64
        buffered = BytesIO()
        edited_image.save(buffered, format="PNG")
        edited_image_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        progress(Message(message=f"image: {edited_image_str}"))
    
    except Exception as e:
        raise e

    finally:
        # Clear CUDA memory
        torch.cuda.empty_cache()


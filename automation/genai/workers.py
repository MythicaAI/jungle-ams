from  automation.sd2 import inpaint_api, InpaintRequest
from  automation.sd3 import generate_image_api, ImageRequest

workers = [
    {
        "path": '/mythica/inpaint',
        "provider": inpaint_api,
        "inputModel": InpaintRequest
    },
    {
        "path": '/stabilityai/stable-diffusion-3-medium',
        "provider": generate_image_api,
        "inputModel": ImageRequest
    },
]
from  automation.sd2 import img2img_inpaint, InpaintRequest
from  automation.sd3 import txt2img, ImageRequest

workers = [
    {
        "path": '/mythica/inpaint',
        "provider": img2img_inpaint,
        "inputModel": InpaintRequest
    },
    {
        "path": '/stabilityai/stable-diffusion-3-medium',
        "provider": txt2img,
        "inputModel": ImageRequest
    },
]
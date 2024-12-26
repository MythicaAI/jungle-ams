import sys
import logging
from  automation.sd2 import img2img_inpaint, InpaintRequest
from  automation.sd3 import txt2img, ImageRequest
from ripple.automation.worker import Worker
from ripple.models.streaming import OutputFiles

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

worker = Worker()

automations = [
    {
        "path": '/mythica/inpaint',
        "provider": img2img_inpaint,
        "inputModel": InpaintRequest,
        "outputModel": OutputFiles
    },
    {
        "path": '/stabilityai/stable-diffusion-3-medium',
        "provider": txt2img,
        "inputModel": ImageRequest,
        "outputModel": OutputFiles
    },
]

def initialize():
    """Empty function to force routes to preload and cache checkpoints in the image."""
    try:
        log.info("Initialization tasks completed successfully.")
    except Exception as e:
        log.error(f"Initialization failed: {e}")
        sys.exit(1)
    sys.exit(0)

def main():
    
    if len(sys.argv) >= 2 and sys.argv[1] == "initialize":
        initialize()
    else:
        worker.start('genai',automations)        

if __name__ == "__main__":
    main()



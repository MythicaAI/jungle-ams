import sys
import logging
from  automation.api import Text2MaterialRequest, Image2MaterialRequest, api_request
from ripple.automation.worker import Worker
from ripple.models.streaming import OutputFiles

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

worker = Worker()

automations = [
    {
        "path": '/mythica/text_2_material',
        "provider": api_request,
        "inputModel": Text2MaterialRequest,
        "outputModel": OutputFiles
    },
    {
        "path": '/mythica/image_2_material',
        "provider": api_request,
        "inputModel": Image2MaterialRequest,
        "outputModel": OutputFiles
    },
]

def main():
    
    worker.start('genai',automations)        

if __name__ == "__main__":
    main()



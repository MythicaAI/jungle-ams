import sys
import logging
from automation.api import (
    Text2MaterialRequest,
    text_2_material_interface,
    Image2MaterialRequest,
    image_2_material_interface,
    Text2ThreeDRequest,
    text_2_three_d_interface,
    ThreeD2ThreeDRequest,
    three_d_2_three_d_interface,
    Image2ThreeDRequest,
    image_2_three_d_interface,
    MultiImage2ThreeDRequest,
    multi_image_2_three_d_interface,
    ApiResponse,
    api_request
)
from meshwork.automation.worker import Worker

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
        "outputModel": ApiResponse,
        "interfaceModel": text_2_material_interface
    },
    {
        "path": '/mythica/image_2_material',
        "provider": api_request,
        "inputModel": Image2MaterialRequest,
        "outputModel": ApiResponse,
        "interfaceModel": image_2_material_interface
    },
    {
        "path": '/mythica/text_2_3d',
        "provider": api_request,
        "inputModel": Text2ThreeDRequest,
        "outputModel": ApiResponse,
        "interfaceModel": text_2_three_d_interface
    },
    {
        "path": '/mythica/3d_2_3d',
        "provider": api_request,
        "inputModel": ThreeD2ThreeDRequest,
        "outputModel": ApiResponse,
        "interfaceModel": three_d_2_three_d_interface
    },
    {
        "path": '/mythica/image_2_3d',
        "provider": api_request,
        "inputModel": Image2ThreeDRequest,
        "outputModel": ApiResponse,
        "interfaceModel": image_2_three_d_interface
    },
    {
        "path": '/mythica/multi_image_2_3d',
        "provider": api_request,
        "inputModel": MultiImage2ThreeDRequest,
        "outputModel": ApiResponse,
        "interfaceModel": multi_image_2_three_d_interface
    },

]


def main():
    worker.start('genai', automations)


if __name__ == "__main__":
    main()

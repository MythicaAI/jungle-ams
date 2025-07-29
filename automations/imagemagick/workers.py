import logging

from automation.crop_image import (
    CropImageRequest,
    CropImageResponse,
    crop_image_request,
)
from meshwork.automation.worker import Worker
from meshwork.config import configure_telemetry, meshwork_config

worker = Worker()

if meshwork_config().telemetry_endpoint:
    configure_telemetry(
        meshwork_config().telemetry_endpoint,
        meshwork_config().telemetry_token,
    )
else:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

automations = [
    {
        "path": '/mythica/crop_image',
        "provider": crop_image_request,
        "inputModel": CropImageRequest,
        "outputModel": CropImageResponse,
    },
]


def main():
    worker.start('imagemagick', automations)


if __name__ == "__main__":
    main()

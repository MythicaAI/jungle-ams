import logging

from automation.crop_image import (
    CropImageRequest,
    CropImageResponse,
    crop_image_request,
)
from ripple.automation.worker import Worker
from ripple.config import configure_telemetry, ripple_config

worker = Worker()

if ripple_config().telemetry_endpoint:
    configure_telemetry(
        ripple_config().telemetry_endpoint,
        ripple_config().telemetry_token,
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

from tempfile import NamedTemporaryFile
from typing import Optional

from ripple.automation.models import CropImageRequest
from ripple.automation.publishers import ResultPublisher
from ripple.models.streaming import CropImageResponse
from wand.image import Image


def crop_image(infile, outfile, crop_h=None, crop_w=None, w=320, h=180):

    with Image(filename=infile) as img:
        original_width, original_height = img.width, img.height
        crop_pos_x = (original_width - w) // 2 if not crop_h else crop_h
        crop_pos_y = (original_height - h) // 2 if not crop_w else crop_w
        img.crop(
            left=crop_pos_x,
            top=crop_pos_y,
            width=w,
            height=h
        )
        img.save(filename=outfile)


def crop_image_request(request: CropImageRequest, result_callback: ResultPublisher) -> CropImageResponse:

    with NamedTemporaryFile(delete=False) as temp_file:
        output_path = temp_file.name

        crop_image(
            request.image_file.file_path,
            output_path,
            request.crop_pos_x.default if request.crop_pos_x else None,
            request.crop_pos_y.default if request.crop_pos_y else None,
            request.crop_w.default,
            request.crop_h.default)
        return CropImageResponse(files={'cropped_image': [output_path]})

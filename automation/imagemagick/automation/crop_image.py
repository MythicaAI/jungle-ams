from tempfile import NamedTemporaryFile

from ripple.models.streaming import Message
from ripple.models.params import FileParameter, IntParameterSpec, ParameterSet
from ripple.models.streaming import Message
from wand.image import Image
from pydantic import Field

class CropImageRequest(ParameterSet):
    image_file: FileParameter
    crop_pos_x: IntParameterSpec
    crop_pos_y: IntParameterSpec
    crop_w: IntParameterSpec
    crop_y: IntParameterSpec

class CropImageResponse(Message):
    files: dict[str, list[str]] = Field(default={"mesh": []})

def crop_image(infile, outfile, x, y, w, h):
    with Image(filename=infile) as img:
        img.crop(
            left=x,
            top=y,
            width=w,
            height=h
        )
        img.save(filename=outfile)


def crop_image_request(request: CropImageRequest, result_callback) -> CropImageResponse:
    result_callback(Message(message=f"Received message: {request.message}"))

    with NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
        output_path = temp_file.name

        crop_image(
            request.image_file.path,
            output_path,
            request.crop_pos_x.x,
            request.crop_pos_y.y,
            request.crop_w,
            request.crop_h)
        return CropImageResponse(files = {'cropped_image': [output_path]})

from  automation.crop_image import crop_image_request, CropImageRequest, CropImageResponse
from ripple.automation.worker import Worker

worker = Worker()

automations = [
    {
        "path": '/mythica/crop_image',
        "provider": crop_image_request,
        "inputModel": CropImageRequest,
        "outputModel": CropImageResponse,
    },
]



def main():
    worker.start('imagemagick',automations)

if __name__ == "__main__":
    main()

from  automation.crop_image import crop_image, CropImageRequest, CropImageResponse
from  automation.clip_video import clip_video, ClipVideoRequest, ClipVideoResponse
from ripple.automation.worker import Worker

worker = Worker()

automations = [
    {
        "path": '/mythica/crop_image',
        "provider": crop_image,
        "inputModel": CropImageRequest,
        "outputModel": CropImageResponse,
    },
    {
        "path": '/mythica/clip_video',
        "provider": crop_image,
        "inputModel": ClipVideoRequest,
        "outputModel": ClipVideoResponse,
    },
]



def main():
    worker.start('imagemagick',automations)

if __name__ == "__main__":
    main()

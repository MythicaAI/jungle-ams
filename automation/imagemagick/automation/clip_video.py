from ripple.models.streaming import Message
from ripple.models.params import ParameterSet
from ripple.models.streaming import Message

class ClipVideoRequest(ParameterSet):
    message: str #Base64 encoded byte string

class ClipVideoResponse(Message):
    pass

def clip_video(request: ClipVideoRequest, result_callback) -> ClipVideoResponse:
    result_callback(Message(message=f"Received message: {request.message}"))
    return ClipVideoResponse()




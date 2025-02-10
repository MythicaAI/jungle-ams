from fastapi import APIRouter, Depends, FastAPI
from typing import Any, Dict

# Create FastAPI and APIRouter
app = FastAPI()
router = APIRouter()


# Fake dependency
def get_user():
    return {"user_id": 123, "name": "Alice"}


# Message handlers
@router.post("/process_text")
async def process_text(data: Dict[str, Any], user: Dict = Depends(get_user)):
    return {"message": f"Processed text: {data['text']}", "user": user}


@router.post("/process_image")
async def process_image(data: Dict[str, Any]):
    return {"message": "Image processed", "size": data["size"]}


# Add routes to the app (optional, for debugging)
app.include_router(router)

# Dispatcher: Maps message ID to handler
message_dispatcher = {
    "TEXT_MESSAGE": router.routes[0].endpoint,  # Direct reference to handler
    "IMAGE_MESSAGE": router.routes[1].endpoint,
}


# Fake message loop
async def message_loop():
    test_messages = [
        {"id": "TEXT_MESSAGE", "payload": {"text": "Hello World"}},
        {"id": "IMAGE_MESSAGE", "payload": {"size": (1920, 1080)}}
    ]

    for msg in test_messages:
        handler = message_dispatcher.get(msg["id"])
        if handler:
            response = await handler(msg["payload"])  # Call like FastAPI would
            print(response)


# Run the dispatcher loop (for testing)
import asyncio

asyncio.run(message_loop())

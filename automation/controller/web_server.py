from fastapi import APIRouter, Depends, FastAPI, status
from worker_controller import WorkerController
from models import HealthResponse, WorkerListResponse

app = FastAPI(openapi_version="3.1.0", root_path='/')
router = APIRouter(prefix="", tags=["main"])
app.include_router(router)

def get_controller() -> WorkerController:
    return app.state.controller

@app.get("/healthz", include_in_schema=False, tags=["internal", "health"])
def health_check(controller: WorkerController = Depends(get_controller)) -> HealthResponse:
    return HealthResponse(status="healthy", metadata=controller.get_metadata())

@app.get("/workers")
def list_workers(controller: WorkerController = Depends(get_controller)) -> WorkerListResponse:
    return WorkerListResponse(workers=controller.get_all_workers())
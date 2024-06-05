import os

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

static_dir = os.path.join(os.path.dirname(__file__), "static")

# Create the router and load the templates
router = APIRouter(prefix="/editor", tags=["editor"])
templates = Jinja2Templates(directory="templates")
router.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get('/', response_class=HTMLResponse)
def editor(request: Request):
    return templates.TemplateResponse(
        request=request, name="editor.html", context={})

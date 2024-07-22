from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get('/login')
async def login():
    pass


@router.get('/logout')
async def logout():
    pass


@router.get('/callback')
async def auth_callback():
    pass

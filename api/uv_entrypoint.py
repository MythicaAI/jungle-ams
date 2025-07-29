import os
from pathlib import Path

import platformdirs
import uvicorn

from config import app_config
from scripts import run


def get_db_path(app_name: str = "your-app") -> Path:
    """Get stable database directory following platform conventions"""

    # Priority order for database location

    # 1. Explicit env var (for containers/deployment)
    if db_path := os.environ.get("DATABASE_PATH"):
        return Path(db_path)

    # 2. Development mode - local directory
    if os.environ.get("ENV") == "development":
        return Path.cwd() / "data" / "app.db"

    # 3. Production - platform-specific user data directory
    data_dir = platformdirs.user_data_dir(app_name)
    return Path(data_dir) / "app.db"


def ensure_db_directory(db_path: Path) -> Path:
    """Ensure database directory exists with proper permissions"""
    db_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    return db_path


# Usage examples
def get_database_url(app_name: str = "your-app") -> str:
    """Get complete database URL for asyncio usage"""
    db_path = ensure_db_directory(get_db_path(app_name))
    return f"sqlite+aiosqlite:///{db_path}"


def db_migration():
    print("starting database migrations")
    run(cmd='uv run alembic -n sqlite revision --autogenerate -m "initial"')
    run(cmd="uv run alembic -n sqlite upgrade head")


def prereqs():
    """
    Setup prerequisites
    """
    # NOTE: :memory: databases don't work with multithreaded tests
    # We use async database operations throughout the server so use
    # the local sqlite+aiosqlite
    sql_url = get_database_url("ams-instance")

    env = {
        "SQL_URL": sql_url,
        "UPLOAD_FOLDER_AUTO_CLEAN": "false",
        "USE_LOCAL_STORAGE": "true",
        "ENVIRONMENT": "dev",
        "HTTP_LISTEN_ADDR": "0.0.0.0",
        "HTTP_LISTEN_PORT": 5555,
        "WORKER_COUNT": 3,
        "API_BASE_URI": "http://localhost:5555/v1",
        "TELEMETRY_ENDPOINT": "",  # disabled
        "NATS_ENDPOINT": "",  # disabled
        "MYTHICA_ENVIRONMENT": "dev",
        "DISCORD_INFRA_ALERTS_WEBHOOK": "",  # disabled
        "MYTHICA_LOCATION": "localhost",
        "K8S_CLUSTER_NAME": "",
    }
    for key, value in env.items():
        os.environ[key] = str(value)

    db_migration()
    cfg = app_config()
    print(f"temporary upload folder is {cfg.upload_folder}")
    print("starting uvicorn service...")
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)


def run_local():
    """Main entry point setup core systems and validate dependencies before serving clients"""
    prereqs()
    cfg = app_config()
    print(f"temporary upload folder is {cfg.upload_folder}")
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)

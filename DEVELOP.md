# Instructions for running infra in local docker and debug mode. 

### Tested on: 

- Ubuntu Linux with Docker Engine and
- Windows 11 with WSL2 and Docker Desktop

### Notes: 

- Docker Desktop for linux lacks GPU support so engine is preferred.
- If using Windows:
  - Make sure you install WSL2 in Windows. 
  - clone `infra` into a WSL path (NOT a windows path)
  - Houdini Automation is currently Linux only (since Houdini is installed on Windows not WSL)


## Docker-Compose setup:

```
#assume current path is ./infra
. env.sh
inv docker-build #(long wait)
inv storage-start web-start auto-start
```

## Local Debug setup:

To debug either `web` or `auto` containers,  you can selective stop the docker compose via `inv web-stop` (or `auto-stop`)  and then start  the corresponding services in debug mode.

Below are the corresponding commands for starting each service in Web:

```
#AMS
cd ams/app
poetry install # only needed when deps change
./debug_entrypoint.sh

#JUNGLE3
cd sites/jungle3
pnpm install # only needed when deps change
pnpm run dev

#AWFUL-UI
cd sites/awful-ui
pnpm install # only needed when deps change
pnpm run dev

#NGINX 
# NB: This is a docker image so you will need to stop it when you are done. 
cd testing/web/nginx
./debug_entrypoint.sh
```

The automation engines:
NB: Houdini automation does not work well on windows using existing shell scripts. 
```
#HOUDINI - THIS IS LINUX ONLY
cd automation/houdini
poetry install
#copy .env to .env.local and enter data
./houdini_local.sh

#All Others (windows too!)
cd automation/[image]
poetry install
poetry run python workers.py
```

Final morsel:

If you use VSCode the following workspace configurations will add the debuggers for the web layer to the project (assuming ams/app, sites/jungle3, sites/awful-ui are Top-level folders in your workspace). 

**NB: If you launch the automation workers in docker-compose mode, you will need to set `"MINIO_ENDPOINT": minio:9000` in the MythicaAPI env vars below**

```
    "tasks": {
        "version": "2.0.0",
        "tasks": [
            {
                "label": "alembic",
                "type": "shell",
                "command": "poetry run alembic upgrade head",
                "options": {
                    "cwd": "${workspaceFolder:app}"
                },
                "problemMatcher": [],
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                }
            }
        ]
    },
    "launch": {
        "version": "0.2.0",
        "configurations": [

            {
                "name": "MythicaAPI",
                "type": "debugpy",
                "request": "launch",
                "cwd": "${workspaceFolder:app}",
                "preLaunchTask": "alembic",
                "module": "uvicorn",
                "python": ".venv/bin/python",
                "args": [
                    "main:app",
                    "--reload",
                    "--port=5555",
                    "--host=0.0.0.0"
                ],
                "jinja": true,
                "env": {
                    "USE_LOCAL_STORAGE":"False"
                    "MINIO_ENDPOINT":"localhost:9000"
                }
            },
            {
                "type": "node-terminal",
                "name": "Awful-UI",
                "request": "launch",
                "command": "pnpm run dev",
                "cwd": "${workspaceFolder:awful-ui}"
            },
            {
                "type": "node-terminal",
                "name": "Jungle3",
                "request": "launch",
                "command": "pnpm run dev",
                "cwd": "${workspaceFolder:jungle3}"
            },
        ]
    }
```

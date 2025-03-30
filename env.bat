@echo off
setlocal enabledelayedexpansion

REM Check if the .infra directory exists
if not exist .infra (
    python -m venv .infra
)

REM Activate the virtual environment
call .infra\Scripts\activate.bat

REM Load environment variables from .env.local (ignoring comment lines)
if exist .env.local (
    for /f "usebackq tokens=1* delims==" %%A in (`findstr /v "^#" .env.local`) do (
        set "%%A=%%B"
    )
)

REM Install local dependencies
pip install -r local_requirements.txt

echo .
echo // .infra virtual env activated and updated, use "deactivate" to exit
echo // use "invoke <task-name> or inv <task-name>" to get started...
echo. 

inv -l

echo.
echo // Setup complete. To activate the environment:
echo call .infra\Scripts\activate.bat
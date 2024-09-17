@echo off
setlocal enabledelayedexpansion

:: Set default site name if not provided
if "%1"=="" (
    set SITE_NAME=jungle3
) else (
    set SITE_NAME=%1
)

:: Get commit hash (assumes git is installed and in PATH)
:: for /f %%i in ('git rev-parse --short=8 HEAD') do set COMMIT_HASH=%%i

:: Get commit hash (assumes git is installed and in PATH)
for /f %%I in ('git rev-parse --short=8 HEAD') do set COMMIT_HASH=%%I
echo Commit hash: %COMMIT_HASH%
set COMMIT_HASH=Foo

:: Get the directory where the script is located
set SCRIPT_DIR=%~dp0

:: Reference the local file relative to the script's directory
set LOCAL_PATH=%SCRIPT_DIR%%SITE_NAME%

:: Create directory if it doesn't exist
if not exist "%LOCAL_PATH%" mkdir "%LOCAL_PATH%"

:: Get full path (Windows doesn't have realpath, this is an approximation)
pushd "%LOCAL_PATH%"
set LOCAL_PATH=%CD%
popd

set IMAGE_TAG=mythica-%SITE_NAME%:%COMMIT_HASH%
set CONTAINER_NAME=mythica-%SITE_NAME%-%COMMIT_HASH%

:: Check if Dockerfile exists
if exist "%SITE_NAME%\Dockerfile" (
    pushd %SITE_NAME%
    docker build -t %IMAGE_TAG% .
    popd

    :: Run container
    docker run -it --name %CONTAINER_NAME% %IMAGE_TAG%

    :: Copy files from container to local path
    docker cp %CONTAINER_NAME%:/app/dist %LOCAL_PATH%

    :: Remove container
    docker rm %CONTAINER_NAME%
) else (
    echo %SITE_NAME% does not have a Dockerfile
    exit /b 1
)
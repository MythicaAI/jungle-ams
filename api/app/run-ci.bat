@echo off
setlocal enabledelayedexpansion

rem Get the directory of the currently executing script
set "SCRIPT_DIR=%~dp0"
rem Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

rem Configure environment variables
call :configure_environment
call :setup_directories
call :run_migrations

rem Run tests with any passed arguments
poetry run pytest . %*
goto :eof

:configure_environment
rem Database settings
set "SQL_URL=sqlite:///%SCRIPT_DIR%\mythica.db"
set "DATABASE_PATH=%SCRIPT_DIR%\mythica.db"

rem Python and storage settings
set "PYTHONPATH=%SCRIPT_DIR%\api\app"
set "UPLOAD_FOLDER_AUTO_CLEAN=false"
set "LOCAL_STORAGE_PATH=%SCRIPT_DIR%\tmp_local_storage"
set "USE_LOCAL_STORAGE=true"
set "TEST_FAIL_RATE=82"
goto :eof

:setup_directories
rem Clean and recreate local storage
if exist "%LOCAL_STORAGE_PATH%" del /F /Q "%LOCAL_STORAGE_PATH%"
mkdir "%LOCAL_STORAGE_PATH%" 2>nul

rem Reset database file
if exist "%DATABASE_PATH%" del /F /Q "%DATABASE_PATH%"
type nul > "%DATABASE_PATH%"

rem Clean and recreate alembic versions directory
if exist "%SCRIPT_DIR%\alembic_sqlite\versions" rmdir /S /Q "%SCRIPT_DIR%\alembic_sqlite\versions"
mkdir "%SCRIPT_DIR%\alembic_sqlite\versions" 2>nul
goto :eof

:run_migrations
rem Run database migrations
poetry run alembic -n sqlite revision --autogenerate -m "initial"
poetry run alembic -n sqlite upgrade head
goto :eof

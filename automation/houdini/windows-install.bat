set PYTHON_EXE=C:\"Program Files"\"Side Effects Software"\"Houdini 20.5.410"\python311\python.exe

echo Clearning virtual env
del /s /q .venv

echo Creating new virtual env for hpython based on the version installed in Houdini
%PYTHON_EXE% -m venv .venv
poetry env use .venv\Scripts\python.exe
poetry install --only main --no-root --all-extras --no-cache

: .venv\Scripts\activate.bat

: test if SFX_CLIENT_ID and SFX_CLIENT_SECRET are set
: set HSERVER_INI=%USERPROFILE%\AppData\Roaming\SideFX\hserver.ini
: echo logFile=%PWD%\hserver.log > %HSERVER_INI%
: echo ClientID=%SFX_CLIENT_ID% >> %HSERVER_INI%
: echo ClientSecret=%SFX_CLIENT_SECRET% >> %HSERVER_INI%
: hserver -S https://www.sidefx.com/license/sesinetd
: hserver -Q

#!/usr/bin/env bash

# Get the directory of the currently executing script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export SQL_URL="sqlite:///${SCRIPT_DIR}/mythica.db"
export DATABASE_PATH="${SCRIPT_DIR}/mythica.db"
export PYTHONPATH="${SCRIPT_DIR}/api/app"
export ENABLE_STORAGE=false
export UPLOAD_FOLDER_AUTO_CLEAN=false

rm -f ${DATABASE_PATH}
touch ${DATABASE_PATH}
rm -rf ${SCRIPT_DIR}/alembic_sqlite/versions
mkdir -p ${SCRIPT_DIR}/alembic_sqlite/versions
poetry run alembic -n sqlite revision --autogenerate -m "initial"
poetry run alembic -n sqlite upgrade head
poetry run pytest .

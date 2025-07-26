#!/usr/bin/env bash

# Get the directory of the currently executing script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# NOTE: :memory: databases don't work with multithreaded tests
# We use async database operations throughout the server so use
# the local sqlite+aiosqlite
export SQL_URL="sqlite+aiosqlite:///${SCRIPT_DIR}/mythica.db"
export DATABASE_PATH="${SCRIPT_DIR}/mythica.db"


export PYTHONPATH="${SCRIPT_DIR}:${SCRIPT_DIR}/tests"
export UPLOAD_FOLDER_AUTO_CLEAN=false
export LOCAL_STORAGE_PATH=${SCRIPT_DIR}/tmp_local_storage
export USE_LOCAL_STORAGE=true
export TEST_FAIL_RATE=82

rm -f ${LOCAL_STORAGE_PATH}
mkdir -p ${LOCAL_STORAGE_PATH}

rm -f ${DATABASE_PATH}
touch ${DATABASE_PATH}
rm -rf ${SCRIPT_DIR}/alembic_sqlite/versions
mkdir -p ${SCRIPT_DIR}/alembic_sqlite/versions
poetry run alembic -n sqlite revision --autogenerate -m "initial"
poetry run alembic -n sqlite upgrade head
poetry run pytest . $*

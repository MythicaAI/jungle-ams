#!/usr/bin/env bash
# Get the directory of the currently executing script
#
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo running from $SCRIPT_DIR
export PYTHONPATH=$SCRIPT_DIR
poetry install --with=dev --no-root
poetry run pylint --disable=R,C,fixme .

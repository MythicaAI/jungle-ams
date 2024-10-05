#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pushd $SCRIPT_DIR
CONFIG_PATH=$SCRIPT_DIR/mythica-api-config.yaml

openapi-python-client generate \
	--url https://api.mythica.ai/v1/openapi.json \
	--config $CONFIG_PATH \
	--overwrite
popd

#!/bin/sh

set -eof pipefail

# shellcheck disable=SC2046
cd /app/api
. $(poetry env info --path)/bin/activate
cd /app

./api/print_ip_address.py

python3 packager.py --endpoint=${PACKAGER_ENDPOINT} $*
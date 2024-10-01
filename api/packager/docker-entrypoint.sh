#!/bin/sh

set -eof pipefail

# shellcheck disable=SC2046
cd /api/app
. $(poetry env info --path)/bin/activate
cd /api/packager

/api/app/print_ip_address.py

python3 packager.py --endpoint=${PACKAGER_ENDPOINT} $*
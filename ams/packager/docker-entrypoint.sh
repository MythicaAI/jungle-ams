#!/bin/sh

set -eof pipefail

# shellcheck disable=SC2046
cd /ams/app
. $(poetry env info --path)/bin/activate
cd /ams/packager

/ams/app/print_ip_address.py

python3 packager.py \
  --endpoint=${MYTHICA_ENDPOINT} \
  --api_key=${MYTHICA_API_KEY} $*

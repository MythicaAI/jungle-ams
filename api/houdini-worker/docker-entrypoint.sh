#!/bin/sh

#set -eof pipefail

# shellcheck disable=SC2046
cd /api/app
. $(poetry env info --path)/bin/activate
cd /api/houdini-worker

/api/app/print_ip_address.py

python3 houdini_worker.py --endpoint=${SERVICE_ENDPOINT} $* &

# Release Houdini licenses held by this worker
cleanup() {
    printf "Received SIGTERM, cleaning up...\n"
    hserver -Q
    printf "Finished cleanup.\n"
}

trap cleanup TERM

while true; do
    sleep 1
done

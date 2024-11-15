#!/bin/bash
export PATH=/opt/houdini/build/bin:$PATH
hserver -S https://www.sidefx.com/license/sesinetd
hython workers.py &

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

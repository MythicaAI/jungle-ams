#!/bin/bash

# setup the hserver.ini based on runtime info
echo "ClientID=${SFX_CLIENT_ID}" >  /root/houdini20.5/hserver.ini
echo "ClientSecret=${SFX_CLIENT_SECRET}" >>  /root/houdini20.5/hserver.ini

# configure logging
echo HOUDINI_ERRORLOG_LEVEL = 0 >> /root/houdini20.5/houdini.env
echo HOUDINI_ERRORLOG_FILENAME = /output/log.txt >> /root/houdini20.5/houdini.env
echo HOUDINI_OCL_DEVICETYPE = CPU >> /root/houdini20.5/houdini.env

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

#!/bin/bash

# Setup license server configuration
echo "ClientID=${SFX_CLIENT_ID}" > /root/houdini20.5/hserver.ini
echo "ClientSecret=${SFX_CLIENT_SECRET}" >> /root/houdini20.5/hserver.ini

# Start the license server
hserver -S https://www.sidefx.com/license/sesinetd

# Cleanup function to release licenses
cleanup() {
    echo "Received SIGTERM, cleaning up..."
    hserver -Q
    echo "Finished cleanup."
}

trap cleanup TERM

/run/houdini_worker 8765 &
sleep 5
python3 test_client.py &
python3 test_client.py &

# Keep the script running to maintain the license
while true; do
    sleep 1
done
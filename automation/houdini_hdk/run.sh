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

# Run the actual program
python3 coordinator.py --executable /run/houdini_worker

# Keep the script running to maintain the license
while true; do
    sleep 1
done
#!/usr/bin/env python3
# Log the local IP address for cloud diagnostics
import socket
hostname = socket.gethostname()
addr = socket.gethostbyname(hostname)
print(f"workload running at: {addr}")

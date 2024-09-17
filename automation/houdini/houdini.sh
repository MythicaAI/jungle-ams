#!/bin/bash
export PATH=/opt/houdini/build/bin:$PATH
hserver -S https://www.sidefx.com/license/sesinetd
hython worker.py "$1" || true
hserver -Q
#!/bin/bash
export PATH=/opt/houdini/build/bin:$PATH
hserver -S https://www.sidefx.com/license/sesinetd
hython workers.py || true
hserver -Q
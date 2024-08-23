hserver -S https://www.sidefx.com/license/sesinetd
hython /darol/automation/helloworld.py
hython /darol/automation/render.py --output-path /output --hda-path=/darol/tests/otls/test_cube.hda
hython /darol/automation/render.py --output-path /output --hda-path=/darol/tests/otls/test_labs.hda
hython /darol/automation/render.py --output-path /output --hda-path=/darol/tests/otls/test_opencl.hda
hython /darol/automation/render.py --output-path /output --hda-path=/darol/tests/otls/test_darol.hda
hserver -Q

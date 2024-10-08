hserver -S https://www.sidefx.com/license/sesinetd
hython /app/automation/helloworld.py
hython /app/automation/render.py --output-path /output --hda-path=/app/tests/otls/test_cube.hda
hython /app/automation/render.py --output-path /output --hda-path=/app/tests/otls/test_labs.hda
hython /app/automation/render.py --output-path /output --hda-path=/app/tests/otls/test_opencl.hda
hython /app/automation/render.py --output-path /output --hda-path=/app/tests/otls/test_darol.hda
hserver -Q

file_count=$(find /output -type f -name "*.png" | wc -l)
if [ "$file_count" -eq 4 ] && [ ! -e /output/log.txt ]; then
    echo "=============================================="
    echo "All tests passed"
    echo "=============================================="
    exit 0
else
    echo "=============================================="
    echo "Tests failed"
    echo "=============================================="
    exit 1
fi
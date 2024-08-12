#!/usr/bin/env bash

# render
docker run -it --rm -v $HOME/darol/houdini-config/output:/output -v $HOME/otls:/darol/automation/otls hautomation /bin/bash -c "hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/render.py --output-path /output --hda-path=automation/otls/mythica.fan_palm.1.0.hda && hserver -Q"

# gather deps
#docker run -it --rm -v D:\Github\darol\houdini-config\output:/output hautomation /bin/bash -c hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/gather_dependencies.py --output-path /output --hda-path=automation/otls/mythica.fan_palm.1.0.hda && hserver -Q

# helloworld
#docker run -it --rm -v $HOME/darol/houdini-config/output:/output hautomation /bin/bash -c "hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/helloworld.py && hserver -Q"

# echo from container
#docker run -it --rm hautomation echo test

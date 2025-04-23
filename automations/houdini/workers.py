


import logging
import os
import sys
print(f"cwd: {os.getcwd()}")
print(f"python path: {sys.path}")


from automation.job_defs import job_defs, JobDefRequest, JobDefResponse

from automation.generate_mesh import generate_mesh, ExportMeshRequest, ExportMeshResponse
from automation.run_hda import hda, HdaRequest, HdaResponse, run_hda, RunHdaRequest, RunHdaResponse
from automation.helloworld import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation.worker import Worker
from ripple.config import configure_telemetry, ripple_config

# Get environment from MYTHICA_ENVIRONMENT env var
mythica_environment = os.environ.get("MYTHICA_ENVIRONMENT", "prod")
debug = mythica_environment == "debug"

worker = Worker()

if ripple_config().telemetry_enable:
    configure_telemetry(
        ripple_config().telemetry_endpoint,
        ripple_config().telemetry_insecure,
    )
else:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

automations = [
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest,
        "outputModel": HelloWorldResponse,
        "hidden": True
    },
    {
        "path": '/mythica/generate_job_defs',
        "provider": job_defs,
        "inputModel": JobDefRequest,
        "outputModel": JobDefResponse,
        "hidden": not debug
    },
    {
        "path": '/mythica/generate_mesh',
        "provider": generate_mesh,
        "inputModel": ExportMeshRequest,
        "outputModel": ExportMeshResponse,
        "hidden": True
    },
    {
        "path": '/mythica/hda',
        "provider": hda,
        "inputModel": HdaRequest,
        "outputModel": HdaResponse
    },
    {
        "path": '/mythica/run_hda',
        "provider": run_hda,
        "inputModel": RunHdaRequest,
        "outputModel": RunHdaResponse,
        "hidden": True
    }

]

def force_limited_commercial_mode():
    dummy_hdalc = './darol-plugin/otls/mythica.test_cube.1.0.hdalc'

    import hou
    hou.hda.installFile(dummy_hdalc)
    node_type = hou.hda.definitionsInFile(dummy_hdalc)[0].nodeTypeName()

    geo = hou.node('obj').createNode('geo')
    asset = geo.createNode(node_type)
    asset.cook()

    hou.hda.uninstallFile(dummy_hdalc)
    hou.hipFile.clear(suppress_save_prompt=True)
    
    assert hou.licenseCategory() == hou.licenseCategoryType.Indie
    print('License set to limited commercial mode')


def main():
    #force_limited_commercial_mode()
    worker.start('houdini',automations)

def fastapi_entry_point():
    """
    Alternate entry point for starting the FastAPI app.
    """
    import uvicorn
    app = worker.start_web(automations)
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "fastapi":
        fastapi_entry_point()
    else:
        main()
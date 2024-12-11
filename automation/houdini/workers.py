from automation.generate_job_defs import generate_job_defs, GenerateJobDefRequest, GenerateJobDefResponse
from automation.generate_mesh import generate_mesh, ExportMeshRequest, ExportMeshResponse
from automation.run_hda import hda, HdaRequest, HdaResponse, run_hda, RunHdaRequest, RunHdaResponse
from ripple.automation import Worker
from telemetry import init_telemetry


worker = Worker()

init_telemetry()

workers = [
    {
        "path": '/mythica/generate_job_defs',
        "provider": generate_job_defs,
        "inputModel": GenerateJobDefRequest,
        "outputModel": GenerateJobDefResponse
    },
    {
        "path": '/mythica/generate_mesh',
        "provider": generate_mesh,
        "inputModel": ExportMeshRequest,
        "outputModel": ExportMeshResponse
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
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

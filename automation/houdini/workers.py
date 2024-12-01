from automation.generate_job_defs import generate_job_defs, GenerateJobDefRequest, GenerateJobDefResponse
from automation.generate_mesh import generate_mesh, ExportMeshRequest, ExportMeshResponse
from automation.helloworld import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation import Worker
worker = Worker()

workers = [
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest,
        "outputModel": HelloWorldResponse
    },
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
    force_limited_commercial_mode()
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

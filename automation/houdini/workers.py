from automation.generate_job_defs import generate_job_defs, GenerateJobDefRequest, GenerateJobDefResponse
from automation.generate_mesh import generate_mesh, ExportMeshRequest
from automation.helloworld import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation import Worker
from ripple.models.streaming import OutputFiles
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
        "outputModel": OutputFiles
    }
]

def main():
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

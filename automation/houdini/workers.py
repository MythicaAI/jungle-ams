from automation.generate_job_defs import generate_job_defs, GenerateJobDefRequest
from automation.generate_mesh import generate_mesh, ExportMeshRequest
from automation.helloworld import hello_world_api, HelloWorldRequest
from ripple.automation import Worker

worker = Worker()

workers = [
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest
    },
    {
        "path": '/mythica/generate_job_defs',
        "provider": generate_job_defs,
        "inputModel": GenerateJobDefRequest
    },
    {
        "path": '/mythica/generate_mesh',
        "provider": generate_mesh,
        "inputModel": ExportMeshRequest
    }
]

def main():
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

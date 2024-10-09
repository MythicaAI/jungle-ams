from automation.generate_job_defs import generate_job_defs
from automation.export_mesh import export_mesh
from automation.helloworld import hello_world_api, HelloWorldRequest
from ripple.automation import Worker
from ripple.models.params import ParameterSet

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
        "inputModel": ParameterSet
    },
    {
        "path": '/mythica/export_mesh',
        "provider": export_mesh,
        "inputModel": ParameterSet
    }
]

def main():
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

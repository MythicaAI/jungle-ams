from automation.generate_job_defs import generate_job_defs
from automation.helloworld import hello_world_api, HelloWorldRequest
from ripple.automation import Worker
from ripple.models.params import ParameterSpec

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
        "inputModel": ParameterSpec
    },
]

def main():
    worker.start('houdini',workers)

if __name__ == "__main__":
    main()

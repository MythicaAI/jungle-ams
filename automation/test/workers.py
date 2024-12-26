from  automation.hello_world import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation.worker import Worker

worker = Worker()

workers = [
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest,
        "outputModel": HelloWorldResponse
    },
]

def main():
    worker.start('test',workers)        

if __name__ == "__main__":
    main()

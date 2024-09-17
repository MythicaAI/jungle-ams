from  automation.helloworld import hello_world_api, HelloWorldRequest

workers = [
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest
    },
]
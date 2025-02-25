class Server:
    """Server state context"""

    def __init__(self, on_begin: dict[str, ProcessContextFactory]):
        self.on_begin = on_begin
        self.processors = dict[str, AsyncSceneProcessor] = {}

class Client:
    """Client state context"""

    def __init__(self, server: Server):
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.stream = StreamContext()
        self.server = server
        self.stack: list[ProcessContext] = []
        self.encoder = Encoder()

    def authorize(self, auth_token):
        pass

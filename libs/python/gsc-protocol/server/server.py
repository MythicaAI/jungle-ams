from files import Cache
from server.process_context import ProcessContextFactory


class Server:
    """Server state context"""

    def __init__(self,
                 on_begin: dict[str, ProcessContextFactory],
                 files: Cache):
        self.on_begin = on_begin
        self.files = files

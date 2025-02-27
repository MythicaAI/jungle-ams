"""
Process context is created around BEGIN / END pairs. These tests validate the internal
contract the server wants to have for the object
"""
from pathlib import Path

from files import Cache
from server.automation import ProcessContext
from server.client import Client
from server.server import Server


def test_commit_rollback():
    did_commit = False
    did_rollback = False

    def validate_context(context: ProcessContext):
        assert context.payload == 'payload'
        assert 'foo' in context.attributes
        assert context.attributes['foo'] == 'bar'

    def test_commit(context: ProcessContext):
        did_commit = True
        validate_context(context)

    def test_rollback(context: ProcessContext):
        did_rollback = True
        validate_context(context)

    files = Cache(Path('fake'))
    server = Server(files)
    client = Client(server)
    commit_context = ProcessContext(client, test_commit, test_rollback)
    rollback_context = ProcessContext(client, test_commit, test_rollback)

    # attributes are built up in processing
    context.attributes['foo'] = 'bar'
    context.payload = 'payload'

import os

from sqlmodel import create_engine, Session

engine_url = os.environ.get('SQL_URL', 'postgresql://test:test@localhost:5432/upload_pipeline').strip()
engine = create_engine(engine_url)


def validate():
    engine.connect()


def get_session(echo=False):
    engine.echo = echo
    return Session(engine)

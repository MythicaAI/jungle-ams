from sqlmodel import create_engine, Session

from config import app_config

engine_url = app_config().sql_url.strip()
engine = create_engine(engine_url)


def validate():
    engine.connect()


def get_session(echo=False):
    engine.echo = echo
    return Session(engine)

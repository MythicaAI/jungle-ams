import os

from sqlalchemy import create_engine, MetaData, Table, insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import sessionmaker

engine_url = os.environ.get('SQL_URL', 'postgresql://test:test@localhost:5432/upload_pipeline').strip()
engine = create_engine(engine_url)


def validate():
    engine.connect()


def get_session():
    session = sessionmaker(bind=engine)()
    return session

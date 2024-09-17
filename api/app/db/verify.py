"""Database verification utility"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import app_config
from db.schema.events import Event
from db.schema.media import FileContent


def verify():
    sql_url = app_config().sql_url.strip()
    engine = create_engine(sql_url)
    session = sessionmaker(bind=engine)()

    # Create a new upload
    upload = FileContent(
        file_name='example.txt',
        content_hash='abc123',
        size=1024,
        file_type='text/plain')
    session.add(upload)
    session.commit()

    # Create a new pipeline event
    event = Event(upload_id=upload.file_id, event_type='processing_started', payload={'key': 'value'})
    session.add(event)
    session.commit()


if __name__ == '__main__':
    verify()

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.db.models import Upload, PipelineEvent


def verify():
    sql_url = os.environ.get('SQL_URL')
    engine = create_engine(sql_url)
    session = sessionmaker(bind=engine)()

    # Create a new upload
    upload = Upload(file_name='example.txt', content_hash='abc123', size=1024, file_type='text/plain',
                    status='upload_started')
    session.add(upload)
    session.commit()

    # Create a new pipeline event
    event = PipelineEvent(upload_id=upload.id, event_type='processing_started', payload={'key': 'value'})
    session.add(event)
    session.commit()

if __name__ == '__main__':
    verify()

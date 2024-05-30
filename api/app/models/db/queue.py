from datetime import datetime

from sqlalchemy.orm import sessionmaker
from models.db.models import PipelineEvent


def dequeue_event(engine):
    Session = sessionmaker(bind=engine)
    session = Session()

    # Get the next unprocessed event
    event = session.query(PipelineEvent).filter(PipelineEvent.processed_at == None).order_by(
        PipelineEvent.created_at).with_for_update(skip_locked=True).first()

    if event:
        # Process the event
        # ...

        # Mark the event as processed
        event.processed_at = datetime.now()
        session.commit()
    else:
        print('No events to process')

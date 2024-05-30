import os

from models.db.models import Upload, PipelineEvent
from context import RequestContext
from models.db.connection import get_session
from sqlalchemy.orm import sessionmaker


def update(ctx: RequestContext):
    # update the postgres index with the elements from the request context
    # Begin a transaction
    session = get_session()

    # Create a new upload
    upload = Upload(uploaded_by=ctx.user,
                    bucket_name=ctx.bucket_name,
                    object_name=ctx.object_name,
                    file_name=ctx.filename,
                    content_hash=ctx.content_hash,
                    size=ctx.file_size,
                    file_type=ctx.extension,
                    status='upload_completed')
    session.add(upload)
    session.commit()

    # Create a new pipeline event
    event = PipelineEvent(
        upload_id=upload.id,
        event_type='file_uploaded',
        payload={'bucket_name': ctx.bucket_name,
                 'object_name': ctx.object_name,
                 'file_size': ctx.file_size,
                 'file_type': ctx.extension,})
    session.add(event)
    session.commit()

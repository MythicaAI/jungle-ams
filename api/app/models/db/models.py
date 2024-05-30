# models.py
from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Upload(Base):
    __tablename__ = 'uploads'

    id = Column(Integer, primary_key=True)
    uploaded_by = Column(String(255), nullable=False)
    bucket_name = Column(String(32), nullable=False)
    object_name = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    content_hash = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default='CURRENT_TIMESTAMP')
    updated_at = Column(DateTime, nullable=False, server_default='CURRENT_TIMESTAMP')
    status = Column(
        Enum('upload_started', 'upload_completed', 'pipeline_started', 'pipeline_completed', name='upload_status'),
        nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class PipelineEvent(Base):
    __tablename__ = 'pipeline_events'

    id = Column(Integer, primary_key=True)
    upload_id = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default='CURRENT_TIMESTAMP')
    processed_at = Column(DateTime)

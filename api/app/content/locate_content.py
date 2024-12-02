from sqlmodel import Session, select

from auth.authorization import Scope, validate_roles
from auth.generate_token import SessionProfile
import auth.roles
from db.schema.media import FileContent


def locate_content_by_hash(session: Session, content_hash: str) -> [FileContent]:
    """Lookup content using the session by its content hash"""
    stmt = select(FileContent).where(FileContent.content_hash == content_hash)
    return session.exec(stmt).all()


def locate_content_by_seq(session: Session, file_seq: int, profile: SessionProfile) -> FileContent:
    """Find file content by its file sequence"""
    stmt = select(FileContent).where(
        FileContent.file_seq == file_seq).where(
        FileContent.deleted is not None)
    result = session.exec(stmt)
    file = result.one_or_none()

    if file:
        validate_roles(role=auth.roles.file_get,
            object_id=file.visibility, auth_roles=profile.auth_roles,
            scope=Scope(profile=profile, file=file))
    return file
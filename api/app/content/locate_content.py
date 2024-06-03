from db.schema.media import FileContent
from db.connection import get_session


def locate_content(content_hash: str) -> FileContent:
    with get_session() as session:
        stmt = session.query(FileContent).filter(FileContent.content_hash == content_hash)
        result = session.exec(stmt)
        file_content = result.one_or_none()
        if file_content is None:
            raise FileNotFoundError
        return file_content

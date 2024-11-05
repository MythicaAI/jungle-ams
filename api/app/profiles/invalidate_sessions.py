from sqlmodel import Session, delete

from db.schema.profiles import ProfileSession


def invalidate_sessions(session: Session, profile_seq: int):
    """Invalidate existing sessions when authentication data changes"""
    # Invalidate previous sessions as the auth data has changed
    session.exec(delete(ProfileSession).where(
        ProfileSession.profile_seq == profile_seq))

    # TODO: do an auth0 kick

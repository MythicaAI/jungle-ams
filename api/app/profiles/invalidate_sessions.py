from sqlmodel import delete
from sqlmodel.ext.asyncio.session import AsyncSession

from db.schema.profiles import ProfileSession


async def invalidate_sessions(db_session: AsyncSession, profile_seq: int):
    """Invalidate existing sessions when authentication data changes"""
    # Invalidate previous sessions as the auth data has changed
    await db_session.exec(delete(ProfileSession).where(
        ProfileSession.profile_seq == profile_seq))

    # TODO: do an auth0 kick

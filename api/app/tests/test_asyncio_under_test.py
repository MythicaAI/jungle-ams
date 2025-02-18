import greenlet
import pytest
from sqlmodel import select

from db.connection import db_connection_lifespan, db_session_pool
from db.schema.profiles import Profile


@pytest.mark.asyncio
async def test_async_to_sync():
    def fun():
        return 42

    assert fun() == 42


@pytest.mark.asyncio
async def test_greenlet():
    did_run = {}

    def f1(x):
        did_run['f1'] = True

    def f2(x):
        did_run['f1'] = True

    greenlet.getcurrent().switch(f1)
    greenlet.getcurrent().switch(f2)

    assert 'f1' in did_run
    assert 'f2' in did_run


@pytest.mark.asyncio
async def test_database_async():
    async with db_connection_lifespan() as engine:
        async with db_session_pool() as session:
            result = await session.exec(select(Profile).where(Profile.profile_seq is 0))
            assert result.one_or_none() is None

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.util import await_only, greenlet_spawn

from config import app_config
# import the SQLModels
from db.schema.tags import *

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = SQLModel.metadata

print("target_metadata tables:")
for key, table in target_metadata.tables.items():
    print(f"table: {key}, type: {table}")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = app_config().sql_url.strip()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online_sync(connection):
    """Synchronous callback to run migrations inside the async connection"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata
    )
    with context.begin_transaction():
        await_only(context.run_migrations())


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Update the config with the environment
    config_dict = config.get_section(config.config_ini_section, {})
    config_dict["sqlalchemy.url"] = app_config().sql_url.strip()
    connectable = AsyncEngine(engine_from_config(
        config_dict,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True
    ))
    async with connectable.connect() as connection:
        await greenlet_spawn(lambda: connection.run_sync(run_migrations_online_sync))
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())

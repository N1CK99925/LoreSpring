from logging.config import fileConfig
import asyncio

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool
from alembic import context

from app.models.base import Base
from app.models.user import User  # noqa: F401
from app.models.chapter import Project, Chapter, ChapterSummary  # noqa: F401
from app.config.settings import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.postgres_url)
target_metadata = Base.metadata

IGNORE_TABLES = {
    "checkpoint_blobs",
    "checkpoint_migrations",
    "checkpoints",
    "checkpoint_writes",
}


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and name in IGNORE_TABLES:
        return False
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    engine = create_async_engine(
        settings.postgres_url, poolclass=pool.NullPool, connect_args={"ssl": True}
    )
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from config.settings import settings


engine = create_async_engine(settings.postgres_url,echo = True,connect_args={"ssl": True,"statement_cache_size": 0})
# TODO: remove prepared_statement_cache_size in prod
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False )


async def get_database():
    async with AsyncSessionLocal() as session:
        yield session
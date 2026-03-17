from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from config.settings import settings


engine = create_async_engine(settings.postgres_url,echo = True)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, connect_args={"ssl": True})


async def get_database():
    async with AsyncSessionLocal() as session:
        yield session
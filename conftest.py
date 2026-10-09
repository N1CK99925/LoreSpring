import os
import pytest

# asgitransport directly connects HTTPX to the app and async client gives get and post type shit
from httpx import ASGITransport, AsyncClient

# when tests run, this changes the prod url to test url
from dotenv import dotenv_values

_env = dotenv_values(".env")

test_db_url = _env.get("POSTGRES_URL_TEST")
prod_db_url = _env.get("POSTGRES_URL")


assert test_db_url
assert prod_db_url
assert test_db_url != prod_db_url, "TEST DB must differ in main DB"

os.environ["POSTGRES_URL"] = test_db_url
# scope session means it will run once per session and autosuse means that every test gets this fixture before


@pytest.fixture(scope="session", autouse=True)
def migrate():
    from alembic import command
    from alembic.config import Config

    config = Config("alembic.ini")
    command.upgrade(config, "head")
    yield


from sqlalchemy import text

from app.db.session import AsyncSessionLocal


@pytest.fixture(autouse=True)
async def clean_db(migrate):
    async with AsyncSessionLocal() as session:
        _ = await session.execute(
            text("""
                TRUNCATE TABLE
                    chapter_summaries,
                    chapters,
                    projects,
                    users
                RESTART IDENTITY CASCADE
            """)
        )
        await session.commit()

    yield


from app.main import app
# put this after cuz we change the postgres url first


@pytest.fixture
async def client(migrate, clean_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as client:
        yield client

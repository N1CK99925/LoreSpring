
from fastapi import FastAPI
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from sqlalchemy import pool
from config.settings import settings
from api.routes import health, generate, review , auth,chapters,projects


@asynccontextmanager
async def lifespan(app):
    pool = AsyncConnectionPool(conninfo=settings.postgres_url_sync, kwargs={"autocommit": True}, min_size=1, max_size=4, open=False)
    await pool.open()
    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()
    app.state.checkpointer = checkpointer
    yield
    await pool.close()


app = FastAPI(lifespan=lifespan)
app.include_router(health.router)
app.include_router(generate.router)
app.include_router(review.router)
app.include_router(auth.router)
app.include_router(chapters.router)
app.include_router(projects.router)



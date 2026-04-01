
from fastapi import FastAPI
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from config.settings import settings
from api.routes import health, generate, review , auth


@asynccontextmanager
async def lifespan(app):
    async with AsyncPostgresSaver.from_conn_string(settings.postgres_url_sync) as checkpointer:
        await checkpointer.setup()
        app.state.checkpointer = checkpointer
        yield


app = FastAPI(lifespan=lifespan)
app.include_router(health.router)
app.include_router(generate.router)
app.include_router(review.router)
app.include_router(auth.router)



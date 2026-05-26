
from fastapi import FastAPI
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool

from config.settings import settings
from api.routes import health, generate, review , auth,chapters,projects, graph_viz
from fastapi.middleware.cors import CORSMiddleware



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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(generate.router)
app.include_router(review.router)
app.include_router(auth.router)
app.include_router(chapters.router)
app.include_router(projects.router)
app.include_router(graph_viz.router)




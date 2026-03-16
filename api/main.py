
from fastapi import FastAPI
from api.routes import health, generate

app = FastAPI()
app.include_router(health.router)
app.include_router(generate.router)

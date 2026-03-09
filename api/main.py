
from fastapi import FastAPI
from api.routes.generate import router

app = FastAPI()
app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok"}


from pydantic_settings import BaseSettings
# from typing import Optional
from urllib.parse import urlparse

class Settings(BaseSettings):
    groq_api_key: str
    # neo4j_uri: str = "bolt://localhost:7687"
    # neo4j_user: str = "neo4j"
    # neo4j_pass: str = "password"
    # pinecone_api_key: str
    # pinecone_env: str = "us-west1-gcp-free" 
    postgres_url: str 
    langsmith_tracing: bool | None = None
    langsmith_endpoint: str | None = None
    langsmith_api_key: str | None = None
    langsmith_project: str | None = None
    postgres_url_sync: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        
    def get_postgres_config(self) -> dict:
        parsed = urlparse(self.postgres_url)
        return {
            "POSTGRES_HOST": parsed.hostname,
            "POSTGRES_PORT": str(parsed.port or 5432),
            "POSTGRES_USER": parsed.username,
            "POSTGRES_PASSWORD": parsed.password,
            "POSTGRES_DATABASE": parsed.path.lstrip("/"),
        }
settings = Settings()

from pydantic_settings import BaseSettings
# from typing import Optional

class Settings(BaseSettings):
    groq_api_key: str
    # neo4j_uri: str = "bolt://localhost:7687"
    # neo4j_user: str = "neo4j"
    # neo4j_pass: str = "password"
    # pinecone_api_key: str
    # pinecone_env: str = "us-west1-gcp-free" 
    # postgres_url: str = "postgresql://user:pass@localhost/langgraph"
    langsmith_tracing: bool | None = None
    langsmith_endpoint: str | None = None
    langsmith_api_key: str | None = None
    langsmith_project: str | None = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
settings = Settings()

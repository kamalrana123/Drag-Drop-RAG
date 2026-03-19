from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_secret_key: str = "dev-secret-change-in-production"
    debug: bool = True
    port: int = 8000
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    # Database
    database_url: str = "sqlite+aiosqlite:///./rag_builder.db"

    # Redis + Celery
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # Storage
    storage_backend: str = "local"   # local | s3 | azure
    upload_dir: str = "./uploads"

    # S3
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_bucket: str = ""
    s3_region: str = "us-east-1"

    # Azure Blob
    azure_connection_string: str = ""
    azure_container: str = "rag-uploads"

    # Vector DBs
    qdrant_url: str = "http://localhost:6333"
    chroma_persist_dir: str = "./chroma_db"

    # API Key encryption (Fernet)
    encryption_key: str = ""


settings = Settings()

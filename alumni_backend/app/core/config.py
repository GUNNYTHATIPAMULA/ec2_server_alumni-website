from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    UPLOAD_DIR: str = "uploads"
    BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")


settings = Settings()

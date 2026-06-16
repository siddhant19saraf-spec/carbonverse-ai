from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "CarbonVerse AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "carbonverse"
    POSTGRES_PASSWORD: str = "carbonverse_secret"
    POSTGRES_DB: str = "carbonverse"
    DATABASE_URL: str | None = None

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    SECRET_KEY: str = "super-secret-key-change-in-production-2024-carbonverse"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    REDIS_URL: str = "redis://localhost:6379/0"

    CORS_ORIGINS: list[str] = Field(default=["http://localhost:3000"])

    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    OPENAI_API_KEY: str | None = None

    LOG_LEVEL: str = "INFO"

    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()

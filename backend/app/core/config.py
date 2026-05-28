from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./app.db"
    upload_dir: str = "./uploads"
    yolo_weights: str = "yolov8n.pt"
    cors_origins: str = "http://localhost:5173"


settings = Settings()


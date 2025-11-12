from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # API Keys
    gemini_api_key: str = ""
    resemble_api_key: str = ""
    
    # Database
    chroma_persist_dir: str = "./chroma_db"
    
    # TTS
    tts_model: str = "tts_models/en/ljspeech/tacotron2-DDC"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    
    # CORS - using string that we'll parse
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    @property
    def origins_list(self) -> List[str]:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()



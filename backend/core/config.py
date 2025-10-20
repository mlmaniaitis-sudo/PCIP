import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Database settings
    DB_USER: str = "pcip_user"
    DB_PASSWORD: str = "pcip_password"
    DB_NAME: str = "pcip_db"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def ASYNCPG_DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
        
    # Twilio settings (for OTP SMS)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_VERIFY_SERVICE_SID: Optional[str] = None
    
    # MQTT settings
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_USERNAME: Optional[str] = None
    MQTT_PASSWORD: Optional[str] = None
    
    # Google Cloud settings (for Earth Engine and Speech)
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    
    # Application settings
    DEBUG: bool = True
    MAX_BOOKING_RADIUS_KM: int = 50
    GREEN_CREDIT_RATE: float = 100.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
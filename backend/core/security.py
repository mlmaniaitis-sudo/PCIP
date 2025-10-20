import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Any
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings
from core.database import db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token scheme
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode a JWT access token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency to get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except (jwt.PyJWTError, KeyError):
        raise credentials_exception
    
    # Fetch user from database
    user = await db.fetch_one(
        "SELECT user_id, phone_number, role, full_name FROM users WHERE user_id = $1",
        user_id
    )
    
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_farmer(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency to get current farmer user"""
    if current_user["role"] != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to farmers"
        )
    return current_user

async def get_current_chc_staff(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency to get current CHC staff user"""
    if current_user["role"] != "chc_staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to CHC staff"
        )
    return current_user

async def get_current_gov_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency to get current government admin user"""
    if current_user["role"] != "gov_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to government administrators"
        )
    return current_user

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from core.config import settings
from core.database import db

# Use shared global database manager instance
_db = db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    await _db.connect()
    print("✅ Database connection established")
    
    yield
    
    # Shutdown
    await _db.disconnect()
    print("✅ Database connection closed")

# Create FastAPI app with lifespan events
app = FastAPI(
    title="PCIP Backend API",
    description="Predictive Compliance & Incentive Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from api import auth
app.include_router(auth.router)

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "PCIP Backend API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection using shared pool
        pool = _db.get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["./"]
    )
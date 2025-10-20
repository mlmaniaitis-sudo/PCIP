import asyncpg
from typing import Optional
from core.config import settings

class DatabaseManager:
    """Manages database connections using asyncpg for PostgreSQL/TimescaleDB"""
    
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool"""
        try:
            self._pool = await asyncpg.create_pool(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
                min_size=5,
                max_size=20,
                command_timeout=60,
            )
            print(f"✅ Connected to database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self._pool:
            await self._pool.close()
            print("✅ Database pool closed")
    
    def get_pool(self) -> asyncpg.Pool:
        """Get the database connection pool"""
        if not self._pool:
            raise RuntimeError("Database pool is not initialized. Call connect() first.")
        return self._pool
    
    async def fetch_one(self, query: str, *args) -> Optional[dict]:
        """Execute query and fetch one row"""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None
    
    async def fetch_all(self, query: str, *args) -> list[dict]:
        """Execute query and fetch all rows"""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
    
    async def execute(self, query: str, *args) -> str:
        """Execute query without returning data"""
        async with self._pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def execute_many(self, query: str, args_list: list) -> None:
        """Execute query multiple times with different parameters"""
        async with self._pool.acquire() as conn:
            await conn.executemany(query, args_list)

# Global database instance
db = DatabaseManager()
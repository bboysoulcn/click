#!/usr/bin/env python3
"""
Database migration script to add performance indexes
"""
import asyncio
import logging
from sqlalchemy import text
from app.database import engine
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def add_indexes():
    """Add performance indexes to existing tables"""
    try:
        async with engine.begin() as conn:
            # Add index for rate limits optimization (regular index, not concurrent)
            logger.info("Adding index idx_rate_limits_hash_created...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rate_limits_hash_created 
                ON rate_limits (identifier_hash, created_at);
            """))
            
            logger.info("Adding index idx_counters_domain_slug_updated...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_counters_domain_slug_updated 
                ON counters (origin_domain, slug, updated_ts DESC);
            """))
            
            logger.info("Adding index idx_counters_updated_ts...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_counters_updated_ts 
                ON counters (updated_ts DESC);
            """))
            
            logger.info("All indexes added successfully!")
            
    except Exception as e:
        logger.error(f"Error adding indexes: {e}")
        raise

async def main():
    logger.info("Starting database index migration...")
    await add_indexes()
    logger.info("Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())

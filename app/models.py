from sqlalchemy import Column, String, BigInteger, DateTime, func, Index, CheckConstraint
from sqlalchemy.sql import text
from app.database import Base
import re



class Counter(Base):
    __tablename__ = "counters"
    
    origin_domain = Column(String(255), primary_key=True, nullable=False)
    slug = Column(String(1024), primary_key=True, nullable=False)
    counter = Column(BigInteger, nullable=False, default=1, server_default=text("1"))
    created_ts = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_ts = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("length(origin_domain) <= 255", name="origin_domain_length_check"),
        CheckConstraint("length(slug) <= 1024", name="slug_length_check"),
        CheckConstraint("slug ~ '^[[:alnum:]/_.%\\-]*$'", name="slug_character_check"),
        Index("idx_counters_domain_slug", "origin_domain", "slug"),
    )
    
    @staticmethod
    def canonicalize_domain(raw_domain: str) -> str:
        """Canonicalize domain name."""
        if not raw_domain or not raw_domain.strip():
            return None
        
        # Remove protocol (http/https)
        cleaned = re.sub(r'https?://', '', raw_domain, flags=re.IGNORECASE)
        # Remove 'www.' prefix
        cleaned = re.sub(r'^www\.', '', cleaned, flags=re.IGNORECASE)
        # Remove port number
        cleaned = cleaned.split(':')[0]
        # Remove path
        cleaned = cleaned.split('/')[0]
        # To lowercase
        cleaned = cleaned.lower()
        
        return cleaned
    
    @staticmethod
    def canonicalize_slug(raw_slug: str) -> str:
        """Canonicalize slug/path."""
        # Remove query string and fragment
        cleaned = raw_slug.split('?')[0]
        cleaned = cleaned.split('#')[0]
        # To lowercase
        cleaned = cleaned.lower()
        
        # Remove trailing slash unless it's the root path
        if len(cleaned) > 1:
            cleaned = cleaned.rstrip('/')
        
        # Default to root if empty
        if not cleaned or cleaned == '/':
            return '/'
        
        return cleaned




class RateLimit(Base):
    __tablename__ = "rate_limits"

    identifier_hash = Column(BigInteger, primary_key=True)
    request_count = Column(BigInteger, nullable=False, default=1, server_default=text("1"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        # 优化速率限制查询的复合索引
        Index("idx_rate_limits_hash_created", "identifier_hash", "created_at"),
        # 单独的时间索引用于清理过期记录
        Index("idx_rate_limits_created", "created_at"),
    )

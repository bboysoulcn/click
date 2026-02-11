from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class GetHitsRequest(BaseModel):
    page_slugs: List[str] = Field(..., max_length=20, description="List of page slugs to get counts for")


class GetHitsResponse(BaseModel):
    counts: Dict[str, int] = Field(default_factory=dict, description="Map of slug to count")


class IncrementHitsRequest(BaseModel):
    page_slug: str = Field(..., max_length=1024, description="Page slug to increment")


class IncrementHitsResponse(BaseModel):
    message: str
    new_count: Optional[int] = None


class StatusResponse(BaseModel):
    status: str = "live"
    version: str = "1.0.1"

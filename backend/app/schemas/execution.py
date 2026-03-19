from datetime import datetime
from typing import Any

from pydantic import BaseModel


class IngestionRequest(BaseModel):
    """Run a specific pipeline by ID, or pass nodes/edges for a one-off run."""
    pipeline_id: str | None = None
    nodes: list[Any] | None = None
    edges: list[Any] | None = None


class JobResponse(BaseModel):
    id: str
    type: str
    status: str
    result: dict | None = None
    error_msg: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QueryRequest(BaseModel):
    query: str
    pipeline_id: str | None = None
    session_id: str | None = None
    # Optional one-off pipeline override
    nodes: list[Any] | None = None
    edges: list[Any] | None = None


class SourceDocument(BaseModel):
    content: str
    metadata: dict[str, Any] = {}


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceDocument] = []
    session_id: str | None = None

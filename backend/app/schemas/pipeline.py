from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel

PipelineType = Literal["ingestion", "retrieval", "agentic", "custom"]


# Kept for backwards-compat with any internal code that uses it
class PipelinePayload(BaseModel):
    nodes: list[Any] = []
    edges: list[Any] = []


class PipelineCreate(BaseModel):
    name: str = "Untitled Pipeline"
    pipeline_type: PipelineType = "custom"
    description: str | None = None
    nodes: list[Any] = []
    edges: list[Any] = []


class PipelineUpdate(BaseModel):
    name: str | None = None
    pipeline_type: PipelineType | None = None
    description: str | None = None
    nodes: list[Any] | None = None
    edges: list[Any] | None = None


class PipelineResponse(BaseModel):
    id: str
    project_id: str
    name: str
    pipeline_type: str
    description: str | None = None
    nodes: list[Any] = []
    edges: list[Any] = []
    updated_at: datetime

    model_config = {"from_attributes": True}

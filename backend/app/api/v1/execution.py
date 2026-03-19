import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.core.security import decrypt_api_keys
from app.db.models import ExecutionJob, LLMConfig, Pipeline, Project, User
from app.dependencies import get_current_user, get_db
from app.pipeline.executor import PipelineExecutor
from app.schemas.execution import (
    IngestionRequest, JobResponse, QueryRequest, QueryResponse,
)

router = APIRouter(prefix="/projects/{project_id}", tags=["Execution"])


async def _get_project_or_404(project_id: str, user: User, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def _load_llm_config(project_id: str, db: AsyncSession) -> dict:
    result = await db.execute(select(LLMConfig).where(LLMConfig.project_id == project_id))
    cfg = result.scalar_one_or_none()
    if not cfg:
        return {}
    api_keys: dict = {}
    if cfg.api_keys_encrypted:
        try:
            api_keys = decrypt_api_keys(cfg.api_keys_encrypted)
        except Exception:
            pass
    return {
        "chat_provider": cfg.chat_provider,
        "chat_model": cfg.chat_model,
        "embedding_provider": cfg.embedding_provider,
        "embedding_model": cfg.embedding_model,
        "temperature": cfg.temperature,
        "max_tokens": cfg.max_tokens,
        "api_keys": api_keys,
    }


async def _load_pipeline(
    project_id: str, db: AsyncSession, pipeline_id: str | None = None
) -> tuple[list, list]:
    if pipeline_id:
        result = await db.execute(
            select(Pipeline).where(Pipeline.id == pipeline_id, Pipeline.project_id == project_id)
        )
        p = result.scalar_one_or_none()
    else:
        # Fall back to the most-recently updated pipeline for this project
        result = await db.execute(
            select(Pipeline)
            .where(Pipeline.project_id == project_id)
            .order_by(Pipeline.updated_at.desc())
        )
        p = result.scalars().first()
    return (p.nodes if p else []), (p.edges if p else [])


# ── Run Ingestion ─────────────────────────────────────────────────────────────

@router.post("/run-ingestion")
async def run_ingestion(
    project_id: str,
    body: IngestionRequest | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    nodes, edges = await _load_pipeline(project_id, db, pipeline_id=body.pipeline_id if body else None)
    # Allow one-off override
    if body and body.nodes is not None:
        nodes, edges = body.nodes, (body.edges or [])

    if not nodes:
        raise HTTPException(status_code=400, detail="No pipeline nodes configured")

    llm_cfg = await _load_llm_config(project_id, db)

    # Create job record
    job = ExecutionJob(project_id=project_id, type="ingestion", status="pending")
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Queue Celery task
    from app.tasks.ingestion import run_ingestion_task
    run_ingestion_task.delay(
        job_id=job.id,
        pipeline_payload={"nodes": nodes, "edges": edges},
        project_id=project_id,
        llm_config=llm_cfg,
    )

    return {"job_id": job.id, "status": "queued"}


# ── Job Status ────────────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(
    project_id: str,
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    result = await db.execute(
        select(ExecutionJob).where(
            ExecutionJob.id == job_id, ExecutionJob.project_id == project_id
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ── Run Query (sync) ──────────────────────────────────────────────────────────

@router.post("/run-query", response_model=QueryResponse)
async def run_query(
    project_id: str,
    body: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    nodes, edges = await _load_pipeline(project_id, db, pipeline_id=body.pipeline_id)
    if body.nodes is not None:
        nodes, edges = body.nodes, (body.edges or [])

    if not nodes:
        raise HTTPException(status_code=400, detail="No pipeline nodes configured")

    llm_cfg = await _load_llm_config(project_id, db)
    executor = PipelineExecutor(project_id=project_id)

    result = await executor.execute_query(
        nodes=nodes, edges=edges, query=body.query, llm_config=llm_cfg
    )
    return QueryResponse(
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
    )


# ── Run Query (SSE streaming) ─────────────────────────────────────────────────

@router.get("/run-query/stream")
async def run_query_stream(
    project_id: str,
    query: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    nodes, edges = await _load_pipeline(project_id, db)
    llm_cfg = await _load_llm_config(project_id, db)
    executor = PipelineExecutor(project_id=project_id)

    async def event_generator() -> AsyncGenerator:
        async for token in executor.stream_query(
            nodes=nodes, edges=edges, query=query, llm_config=llm_cfg
        ):
            if await request.is_disconnected():
                break
            yield {"data": json.dumps(token)}

    return EventSourceResponse(event_generator())

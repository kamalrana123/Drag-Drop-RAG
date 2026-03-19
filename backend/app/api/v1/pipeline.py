from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Pipeline, Project, User
from app.dependencies import get_current_user, get_db
from app.schemas.pipeline import PipelineCreate, PipelineResponse, PipelineUpdate

router = APIRouter(prefix="/projects/{project_id}/pipelines", tags=["Pipelines"])


async def _get_project_or_404(project_id: str, user: User, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def _get_pipeline_or_404(pipeline_id: str, project_id: str, db: AsyncSession) -> Pipeline:
    result = await db.execute(
        select(Pipeline).where(Pipeline.id == pipeline_id, Pipeline.project_id == project_id)
    )
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[PipelineResponse])
async def list_pipelines(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    result = await db.execute(
        select(Pipeline)
        .where(Pipeline.project_id == project_id)
        .order_by(Pipeline.updated_at.desc())
    )
    return result.scalars().all()


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=PipelineResponse, status_code=201)
async def create_pipeline(
    project_id: str,
    body: PipelineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    pipeline = Pipeline(
        project_id=project_id,
        name=body.name,
        pipeline_type=body.pipeline_type,
        description=body.description,
        nodes=body.nodes,
        edges=body.edges,
    )
    db.add(pipeline)
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


# ── Get ───────────────────────────────────────────────────────────────────────

@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline(
    project_id: str,
    pipeline_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    return await _get_pipeline_or_404(pipeline_id, project_id, db)


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/{pipeline_id}", response_model=PipelineResponse)
async def update_pipeline(
    project_id: str,
    pipeline_id: str,
    body: PipelineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    pipeline = await _get_pipeline_or_404(pipeline_id, project_id, db)

    if body.name is not None:
        pipeline.name = body.name
    if body.pipeline_type is not None:
        pipeline.pipeline_type = body.pipeline_type
    if body.description is not None:
        pipeline.description = body.description
    if body.nodes is not None:
        pipeline.nodes = body.nodes
    if body.edges is not None:
        pipeline.edges = body.edges

    await db.commit()
    await db.refresh(pipeline)
    return pipeline


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{pipeline_id}", status_code=204)
async def delete_pipeline(
    project_id: str,
    pipeline_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    pipeline = await _get_pipeline_or_404(pipeline_id, project_id, db)
    await db.delete(pipeline)
    await db.commit()

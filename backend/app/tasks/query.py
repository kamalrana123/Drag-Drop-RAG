"""Celery task: run_query — for long-running query pipelines (optional background path)."""
import asyncio
from datetime import datetime, timezone

from app.core.celery_app import celery_app


def _update_job(job_id: str, status: str, result: dict | None = None, error_msg: str | None = None):
    async def _inner():
        from sqlalchemy import update
        from app.db.database import AsyncSessionLocal
        from app.db.models import ExecutionJob

        async with AsyncSessionLocal() as session:
            values = {"status": status, "updated_at": datetime.now(timezone.utc)}
            if result is not None:
                values["result"] = result
            if error_msg is not None:
                values["error_msg"] = error_msg
            await session.execute(
                update(ExecutionJob).where(ExecutionJob.id == job_id).values(**values)
            )
            await session.commit()

    asyncio.run(_inner())


@celery_app.task(bind=True, name="tasks.run_query")
def run_query_task(
    self,
    job_id: str,
    pipeline_payload: dict,
    project_id: str,
    query: str,
    llm_config: dict,
):
    """Execute a query pipeline in the background and store the result."""
    _update_job(job_id, "running")

    try:
        from app.pipeline.executor import PipelineExecutor

        executor = PipelineExecutor(project_id=project_id)
        result = asyncio.run(
            executor.execute_query(
                nodes=pipeline_payload.get("nodes", []),
                edges=pipeline_payload.get("edges", []),
                query=query,
                llm_config=llm_config,
            )
        )
        _update_job(job_id, "done", result=result)

    except Exception as exc:
        _update_job(job_id, "error", error_msg=str(exc))
        raise self.retry(exc=exc, max_retries=0)

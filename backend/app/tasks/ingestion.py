"""Celery task: run_ingestion — executes the ingestion pipeline in a background worker."""
import asyncio
from datetime import datetime, timezone

from app.core.celery_app import celery_app


def _update_job(job_id: str, status: str, result: dict | None = None, error_msg: str | None = None):
    """Synchronously update job status in the database."""
    import asyncio
    from sqlalchemy import select, update
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.db.database import AsyncSessionLocal
    from app.db.models import ExecutionJob

    async def _inner():
        async with AsyncSessionLocal() as session:
            values = {
                "status": status,
                "updated_at": datetime.now(timezone.utc),
            }
            if result is not None:
                values["result"] = result
            if error_msg is not None:
                values["error_msg"] = error_msg

            await session.execute(
                update(ExecutionJob).where(ExecutionJob.id == job_id).values(**values)
            )
            await session.commit()

    asyncio.run(_inner())


@celery_app.task(bind=True, name="tasks.run_ingestion")
def run_ingestion_task(
    self,
    job_id: str,
    pipeline_payload: dict,
    project_id: str,
    llm_config: dict,
):
    """Execute the ingestion pipeline and update the job record."""
    _update_job(job_id, "running")

    try:
        from app.pipeline.executor import PipelineExecutor

        nodes = pipeline_payload.get("nodes", [])
        edges = pipeline_payload.get("edges", [])

        executor = PipelineExecutor(project_id=project_id)

        statuses: dict[str, str] = {}

        def on_status(node_id: str, status: str):
            statuses[node_id] = status

        result = asyncio.run(
            executor.execute_ingestion(
                nodes=nodes,
                edges=edges,
                llm_config=llm_config,
                on_status=on_status,
            )
        )

        _update_job(
            job_id,
            status="done",
            result={**result, "node_statuses": statuses},
        )

    except Exception as exc:
        _update_job(job_id, status="error", error_msg=str(exc))
        raise self.retry(exc=exc, max_retries=0)

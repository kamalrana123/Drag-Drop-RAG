from fastapi import APIRouter

from app.api.v1 import auth, deploy, documents, execution, llm_config, pipeline, projects

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(documents.router)
api_router.include_router(pipeline.router)
api_router.include_router(llm_config.router)
api_router.include_router(execution.router)
api_router.include_router(deploy.router)

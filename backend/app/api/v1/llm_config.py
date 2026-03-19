from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_api_keys, encrypt_api_keys
from app.db.models import LLMConfig, Project, User
from app.dependencies import get_current_user, get_db
from app.schemas.llm_config import LLMConfigResponse, LLMConfigSchema

router = APIRouter(prefix="/projects/{project_id}/llm-config", tags=["LLM Config"])


async def _get_project_or_404(project_id: str, user: User, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _to_response(cfg: LLMConfig) -> LLMConfigResponse:
    configured_keys: list[str] = []
    if cfg.api_keys_encrypted:
        try:
            configured_keys = list(decrypt_api_keys(cfg.api_keys_encrypted).keys())
        except Exception:
            pass
    return LLMConfigResponse(
        chat_provider=cfg.chat_provider,
        chat_model=cfg.chat_model,
        embedding_provider=cfg.embedding_provider,
        embedding_model=cfg.embedding_model,
        temperature=cfg.temperature,
        max_tokens=cfg.max_tokens,
        configured_keys=configured_keys,
    )


@router.get("", response_model=LLMConfigResponse)
async def get_llm_config(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    result = await db.execute(select(LLMConfig).where(LLMConfig.project_id == project_id))
    cfg = result.scalar_one_or_none()
    if not cfg:
        return LLMConfigResponse(
            chat_provider="openai", chat_model="gpt-4o",
            embedding_provider="openai", embedding_model="text-embedding-3-small",
            temperature=0.7, max_tokens=2048,
        )
    return _to_response(cfg)


@router.put("", response_model=LLMConfigResponse)
async def save_llm_config(
    project_id: str,
    body: LLMConfigSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user, db)
    result = await db.execute(select(LLMConfig).where(LLMConfig.project_id == project_id))
    cfg = result.scalar_one_or_none()

    # Encrypt API keys if provided
    encrypted: str | None = None
    if body.api_keys:
        # Merge with existing keys so old keys aren't wiped on partial update
        existing_keys: dict = {}
        if cfg and cfg.api_keys_encrypted:
            try:
                existing_keys = decrypt_api_keys(cfg.api_keys_encrypted)
            except Exception:
                pass
        merged = {**existing_keys, **body.api_keys}
        encrypted = encrypt_api_keys(merged)

    if cfg:
        cfg.chat_provider = body.chat_provider
        cfg.chat_model = body.chat_model
        cfg.embedding_provider = body.embedding_provider
        cfg.embedding_model = body.embedding_model
        cfg.temperature = body.temperature
        cfg.max_tokens = body.max_tokens
        if encrypted:
            cfg.api_keys_encrypted = encrypted
    else:
        cfg = LLMConfig(
            project_id=project_id,
            chat_provider=body.chat_provider,
            chat_model=body.chat_model,
            embedding_provider=body.embedding_provider,
            embedding_model=body.embedding_model,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
            api_keys_encrypted=encrypted,
        )
        db.add(cfg)

    await db.commit()
    await db.refresh(cfg)
    return _to_response(cfg)

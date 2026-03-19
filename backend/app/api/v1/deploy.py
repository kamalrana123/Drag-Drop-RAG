from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LLMConfig, Pipeline, Project
from app.dependencies import get_current_user, get_db
from app.db.models import User
from app.pipeline.executor import PipelineExecutor
from app.core.security import decrypt_api_keys

router = APIRouter(tags=["Deploy"])


@router.get("/projects/{project_id}/share-info")
async def share_info(
    project_id: str,
    request_base_url: str = "http://localhost:8000",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "share_url": f"{request_base_url}/share/{project_id}",
        "embed_url": f"{request_base_url}/embed/{project_id}",
    }


@router.get("/share/{project_id}", response_class=HTMLResponse)
async def public_share_page(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>{project.name} — RAG Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            body {{ margin: 0; font-family: system-ui, sans-serif; background: #f9fafb; }}
            .header {{ background: #4f46e5; color: white; padding: 16px 24px; }}
            .chat {{ max-width: 720px; margin: 32px auto; padding: 0 16px; }}
            input {{ width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }}
            button {{ margin-top: 8px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; }}
            .msg {{ margin: 12px 0; padding: 12px; border-radius: 8px; }}
            .user {{ background: #ede9fe; }}
            .assistant {{ background: white; border: 1px solid #e5e7eb; }}
        </style>
    </head>
    <body>
        <div class="header"><h2>{project.name}</h2></div>
        <div class="chat">
            <div id="messages"></div>
            <input id="q" placeholder="Ask a question…" />
            <button onclick="ask()">Send</button>
        </div>
        <script>
            async function ask() {{
                const q = document.getElementById('q').value.trim();
                if (!q) return;
                addMsg('user', q);
                document.getElementById('q').value = '';
                const r = await fetch('/share/{project_id}/query', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{query: q}})
                }});
                const d = await r.json();
                addMsg('assistant', d.answer || d.detail || 'Error');
            }}
            function addMsg(role, text) {{
                const div = document.createElement('div');
                div.className = 'msg ' + role;
                div.textContent = (role === 'user' ? 'You: ' : 'AI: ') + text;
                document.getElementById('messages').appendChild(div);
            }}
        </script>
    </body>
    </html>
    """)


@router.post("/share/{project_id}/query")
async def public_query(project_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    pipeline_result = await db.execute(select(Pipeline).where(Pipeline.project_id == project_id))
    pipeline = pipeline_result.scalar_one_or_none()
    if not pipeline or not pipeline.nodes:
        raise HTTPException(status_code=400, detail="Pipeline not configured")

    cfg_result = await db.execute(select(LLMConfig).where(LLMConfig.project_id == project_id))
    cfg = cfg_result.scalar_one_or_none()
    llm_config: dict = {}
    if cfg:
        api_keys = decrypt_api_keys(cfg.api_keys_encrypted) if cfg.api_keys_encrypted else {}
        llm_config = {
            "chat_provider": cfg.chat_provider, "chat_model": cfg.chat_model,
            "embedding_provider": cfg.embedding_provider, "embedding_model": cfg.embedding_model,
            "temperature": cfg.temperature, "max_tokens": cfg.max_tokens,
            "api_keys": api_keys,
        }

    executor = PipelineExecutor(project_id=project_id)
    query_result = await executor.execute_query(
        nodes=pipeline.nodes, edges=pipeline.edges,
        query=body.get("query", ""), llm_config=llm_config,
    )
    return {"answer": query_result.get("answer", ""), "sources": query_result.get("sources", [])}

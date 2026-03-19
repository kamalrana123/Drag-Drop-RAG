# Backend Implementation Plan — Visual RAG Builder

## Stack
- **Framework**: Python 3.11 + FastAPI
- **Auth**: JWT (python-jose + passlib/bcrypt)
- **Database**: SQLite (dev) / PostgreSQL (prod) via SQLAlchemy async + Alembic
- **Vector DB**: ChromaDB + Qdrant — auto-detect from pipeline node type
- **File Storage**: Pluggable — `local` / `s3` / `azure` via `STORAGE_BACKEND` env var
- **Background Jobs**: Celery + Redis
- **LLM Streaming**: SSE via `sse-starlette`
- **LLM Providers**: OpenAI, Google Gemini, Anthropic Claude, Ollama

## Directory Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, CORS, middleware, routers
│   ├── config.py                  # Pydantic Settings (reads .env)
│   ├── dependencies.py            # DI: get_current_user, get_db
│   ├── api/v1/
│   │   ├── router.py
│   │   ├── auth.py                # /auth/register, /auth/login, /auth/me
│   │   ├── projects.py            # /projects CRUD
│   │   ├── documents.py           # /projects/{id}/documents
│   │   ├── pipeline.py            # /projects/{id}/pipeline
│   │   ├── llm_config.py          # /projects/{id}/llm-config
│   │   ├── execution.py           # /run-ingestion, /run-query, /jobs
│   │   └── deploy.py              # /share/{id}
│   ├── core/
│   │   ├── security.py            # JWT + bcrypt
│   │   ├── celery_app.py          # Celery + Redis
│   │   └── storage.py             # StorageBackend abstraction
│   ├── db/
│   │   ├── database.py            # Async SQLAlchemy engine
│   │   ├── models.py              # ORM models
│   │   └── migrations/            # Alembic versions
│   ├── pipeline/
│   │   ├── executor.py            # Pipeline execution engine
│   │   ├── graph.py               # DAG + topological sort
│   │   ├── llm_factory.py         # Multi-provider LLM/embedding builder
│   │   └── node_handlers/         # One file per node category (13 files)
│   ├── schemas/                   # Pydantic request/response models
│   └── tasks/
│       ├── ingestion.py           # Celery ingestion task
│       └── query.py               # Celery query task
├── tests/
├── plan/
│   └── backend_plan.md            ← this file
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── alembic.ini
```

## Database Models

| Model | Key Fields |
|---|---|
| User | id, email, hashed_password, created_at, is_active |
| Project | id, user_id, name, description, created_at, updated_at |
| Document | id, project_id, filename, storage_key, mime_type, size_bytes, status, error_msg |
| Pipeline | id, project_id (unique), nodes (JSON), edges (JSON), updated_at |
| LLMConfig | id, project_id (unique), chat_provider, chat_model, embedding_provider, embedding_model, temperature, max_tokens, api_keys_encrypted |
| ExecutionJob | id, project_id, type, status, result (JSON), error_msg, created_at, updated_at |
| ChatSession | id, project_id, messages (JSON), created_at, updated_at |

## API Routes Summary

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

GET|POST         /api/v1/projects
GET|PUT|DELETE   /api/v1/projects/{id}

GET|POST         /api/v1/projects/{id}/documents
DELETE           /api/v1/projects/{id}/documents/{doc_id}
GET              /api/v1/projects/{id}/documents/{doc_id}/status

GET|PUT          /api/v1/projects/{id}/pipeline
GET|PUT          /api/v1/projects/{id}/llm-config

POST             /api/v1/projects/{id}/run-ingestion   → { job_id }
GET              /api/v1/projects/{id}/jobs/{job_id}   → JobResponse
POST             /api/v1/projects/{id}/run-query       → { answer, sources }
GET              /api/v1/projects/{id}/run-query/stream → SSE

GET    /health
GET    /share/{id}
POST   /share/{id}/query
```

## Implementation Phases

- **Phase 1** — Foundation: app setup, DB models, auth, project CRUD
- **Phase 2** — Document Management: upload, storage abstraction, status tracking
- **Phase 3** — Pipeline & LLM Config: save/load pipeline, encrypted API keys
- **Phase 4** — Core Execution (Ingestion): DAG engine, Celery, ingestion node handlers
- **Phase 5** — Query Pipeline: retrieval/rerank/LLM handlers, SSE streaming
- **Phase 6** — Advanced Nodes: agentic, graph RAG, memory, query transforms
- **Phase 7** — Deploy & Hardening: share endpoints, rate limiting, tests, production Docker

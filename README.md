# LoreSpring

![LoreSpring dashboard](Screenshot_20260709_005753.png)

LoreSpring is a full-stack storytelling platform for generating, reviewing, and refining long-form narrative chapters with the help of an LLM-driven multi-agent pipeline and a persistent story memory graph.

The product is built around a simple authoring loop:

1. Create a story project with genre, tone, and style.
2. Describe the next chapter direction.
3. Run the backend pipeline to generate a chapter draft.
4. Review the draft in the UI and approve or reject it.
5. Approved chapters are persisted and expand the story memory graph, which feeds future chapters.

## What the project does

LoreSpring combines:

- A **FastAPI backend** for authentication (JWT + Google OAuth), project management, streaming chapter generation, review, and story-graph endpoints.
- A **LangGraph pipeline** of specialised agents — writer, continuity checker, revision loop, summarizer, human review, and lore keeper — orchestrated as a stateful workflow with Postgres-backed checkpoints.
- A **LightRAG memory layer** that indexes accepted chapters into a Neo4j knowledge graph plus Postgres vector storage, so later chapters can retrieve established lore.
- A **React + TypeScript + Vite frontend** for the landing page, dashboard, chapter editor, review flow, and an interactive force-directed story-graph visualization.

## Architecture

### Backend — the `app` package

The entire backend lives in the [app](app) package.

- [app/main.py](app/main.py) — creates the FastAPI app, wires CORS, session middleware, rate-limit handling, and a lifespan that opens the Postgres checkpointer pool and connects to Neo4j.
- [app/api/routes](app/api/routes) — HTTP endpoints for auth, Google OAuth, projects, chapters, generation (sync + streaming), review, graph visualization, and health.
- [app/api/deps.py](app/api/deps.py) — JWT bearer-token dependency that resolves the current user.
- [app/core](app/core) — slowapi rate limiting with per-user keys and configured limits.
- [app/auth](app/auth) — JWT creation/verification and Argon2 password hashing.
- [app/config](app/config) — Pydantic-settings environment configuration.
- [app/domain](app/domain) — Pydantic schemas for requests, responses, revision scoring, summaries, lore facts, and continuity results.
- [app/generation](app/generation) — the LangGraph workflow (`graph.py`, `pipeline.py`, `state.py`) and the streaming event mapper.
- [app/generation/agents](app/generation/agents) — the individual agent nodes:
  - **writer** — generates the draft (or a targeted rewrite) from project metadata, chapter direction, prior summaries, and retrieved lore.
  - **continuity** — validates the draft against established canon and flags contradictions by severity.
  - **revision** — scores the draft 0–10 across five quality dimensions and drives the rewrite loop.
  - **summarizer** — extracts a summary, key events, and character-state updates for future context.
  - **human_review** — pauses the graph for approval (LangGraph interrupt).
  - **lore_keeper** — indexes the accepted chapter into the memory layer.
- [app/llm](app/llm) — Groq LLM client wiring and per-task model selection.
- [app/models](app/models) — SQLAlchemy models: `User`, `Project`, `Chapter`, `ChapterSummary`.
- [app/db](app/db) — async session management, Alembic migrations, and Postgres repository functions.
- [app/services](app/services) — service layer for projects and chapters.
- [app/memory](app/memory) — LightRAG integration plus the Jina embedding client.
- [app/graph_db](app/graph_db) — the Neo4j `GraphService` used for the story-graph API.

### Generation pipeline

`build_graph` in [app/generation/graph.py](app/generation/graph.py) compiles the workflow:

```
writer → continuity ──┬─ (critical issues & revisions left) → writer
                      └─ (clean / revisions exhausted) → reviewer ──┬─ (below threshold & revisions left) → writer
                                                                    └─ (accepted) → summarizer → human_review → lorekeeper → end
```

1. The **writer** produces an 800–1200 word draft from project metadata, the chapter direction, prior chapter summaries, and lore retrieved from memory.
2. The **continuity** agent cross-checks the draft against canonical lore. High-severity contradictions route back to the writer.
3. The **revision** agent scores the draft on pacing, character depth, prose clarity, tension, and prompt adherence. Below the quality threshold (with revisions remaining) the writer receives a targeted revision plan and banned phrases.
4. The **summarizer** produces a dense summary plus key events and character updates.
5. **Human review** pauses the workflow with an interrupt. The frontend shows the draft and quality score; approving (with optional inline edits) or rejecting resumes the thread.
6. The **lore keeper** indexes the accepted chapter into the memory graph. On approval the chapter and its summary are also saved to Postgres.

State is checkpointed by an `AsyncPostgresSaver`, keyed by thread id `{project_id}-chapter-{chapter_number}`, which lets runs pause at the human-review interrupt and resume later.

The streaming endpoint emits friendly per-node status events over SSE (`Writing chapter`, `Checking continuity`, `Awaiting human review`, …) mapped in [app/generation/graph_events.py](app/generation/graph_events.py).

### Memory layer

Accepted chapters are indexed with **LightRAG** into a per-`(user, project)` workspace:

- **Neo4j** — graph storage of entities and relationships (the "story graph").
- **PostgreSQL** — vector storage (`PGVectorStorage`), KV, and document-status storage.
- **Jina embeddings** (`jina-embeddings-v3`, 1024 dims) via [app/memory/embedding.py](app/memory/embedding.py), with retry/backoff on provider rate limits.
- LightRAG's internal LLM calls run through Groq.

The graph API ([app/graph_db/neo4j.py](app/graph_db/neo4j.py)) reads the workspace-labeled nodes and relationships so the frontend can render the story graph.

### Frontend

The frontend lives under [frontend](frontend) and uses React 19, TypeScript, Vite, Tailwind v4, and `react-force-graph-2d`.

- [frontend/src/pages](frontend/src/pages) — `LandingPage`, `Login`, `Register`, `AuthCallback`, `Dashboard`, `Project`, `Review`, `GraphPage`, and `PipelinePage` (the agent-flow explainer).
- [frontend/src/api](frontend/src/api) — typed wrappers for auth, projects, chapters, generation (including the SSE stream consumer), and review.
- [frontend/src/components](frontend/src/components) — reusable UI such as the dashboard sidebar, project modal, landing sections, and error banner.
- [frontend/src/hooks](frontend/src/hooks) — data-fetching and scroll-reveal hooks.
- [frontend/src/types](frontend/src/types) — shared TypeScript interfaces.

## Repository layout

- [app](app) — FastAPI application, agents, graph, memory, and domain logic
- [app/api/routes](app/api/routes) — HTTP endpoint definitions
- [app/generation](app/generation) — LangGraph workflow, pipeline, and agent nodes
- [app/memory](app/memory) — LightRAG and embedding integration
- [app/graph_db](app/graph_db) — Neo4j graph service
- [app/models](app/models) — SQLAlchemy models
- [app/db](app/db) — session management and Alembic migrations
- [app/domain](app/domain) — Pydantic request/response and agent payload schemas
- [app/services](app/services) — service layer for projects and chapters
- [app/auth](app/auth) — JWT and password handling
- [app/core](app/core) — rate limiting
- [frontend](frontend) — React/Vite client application
- [alembic.ini](alembic.ini) — Alembic configuration (migrations in `app/db/migrations`)
- [lore_db](lore_db) — working directory for LightRAG artifacts
- [tests](tests) / [app/tests](app/tests) — test scaffolding

## Core user flow

1. Register (or sign in with Google).
2. Create a project with genre, tone, and style.
3. Open the project and enter a chapter direction.
4. Run generation — watch the pipeline progress stream live.
5. Review the draft, score, and summary in the review screen.
6. Approve to persist the chapter, or reject to discard it and regenerate.
7. Explore the story graph, which grows with every accepted chapter.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A managed or reachable **PostgreSQL** instance (async + sync connection strings)
- A **Neo4j** instance (e.g. Neo4j Aura) for the graph-backed memory layer
- **Groq** and **Jina** API keys
- Google OAuth credentials for the Google sign-in flow

## Environment configuration

Create a `.env` file at the repository root. See [.example.env](.example.env) for a full template.

```env
GROQ_API_KEY=your_groq_key
JINA_API_KEY=your_jina_key
POSTGRES_URL=postgresql+asyncpg://user:password@host:5432/dbname
POSTGRES_URL_SYNC=postgresql+psycopg://user:password@host:5432/dbname

SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173

NEO4J_URI=bolt://host:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# LightRAG storage backends (all Postgres-backed)
LIGHTRAG_KV_STORAGE=PGKVStorage
LIGHTRAG_GRAPH_STORAGE=PGGraphStorage
LIGHTRAG_VECTOR_STORAGE=PGVectorStorage
LIGHTRAG_DOC_STATUS_STORAGE=PGDocStatusStorage

# Optional observability
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT=LoreSpring

# Optional frontend API override for local development
VITE_API_URL=http://localhost:8000
```

Notes:

- Settings are read by [app/config/settings.py](app/config/settings.py) from `.env`.
- Both async and sync Postgres URLs are required: the backend uses async SQLAlchemy while Alembic, the LangGraph checkpointer pool, and startup tasks need a sync-capable connection.
- Neo4j and LightRAG settings are read directly from environment variables in [app/graph_db/neo4j.py](app/graph_db/neo4j.py) and [app/memory/rag.py](app/memory/rag.py).
- The project targets managed Postgres (e.g. Neon) and Neo4j Aura rather than local containers.

## Local development

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will usually run at http://localhost:5173.

## Docker

The repository includes a Docker setup for the backend and frontend.

```bash
docker compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

The backend container entrypoint runs Alembic migrations before starting the app, and the frontend is served by nginx. Point `POSTGRES_URL` and `NEO4J_URI` in `.env` at your managed endpoints — no local database containers are used.

## Database migrations

Migrations are managed with Alembic (scripts under [app/db/migrations](app/db/migrations)).

```bash
alembic upgrade head
```

If you change the SQLAlchemy models under [app/models](app/models), generate a new migration with:

```bash
alembic revision --autogenerate -m "describe your change"
```

## API overview

### Health

- GET /health

### Authentication

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/google
- GET /auth/google/callback

### Projects

- POST /projects
- GET /projects
- GET /projects/{project_id}

### Chapters

- GET /chapters/{project_id}

### Generation

- POST /generate — run the pipeline and return the final chapter
- POST /projects/{project_id}/chapters/{chapter_number}/generate/stream — run the pipeline and stream status events as SSE

### Review

- GET /review/{thread_id} — fetch the pending human-review interrupt
- POST /resume/{thread_id} — approve (optionally with edited text) or reject

### Graph

- GET /graph?project_id=... — nodes and edges for the story graph
- GET /debug/neo4j — Neo4j connectivity check

LLM endpoints are rate-limited per user via slowapi.

## Development notes

- The project is intentionally backend-first: quality and continuity are enforced in the pipeline, and the frontend focuses on the core authoring loop.
- Pipeline runs are resumable thanks to the Postgres checkpointer; interrupted threads stay parked at human review until resumed.
- Some parts of the repository still contain TODOs or experimental hooks, so expect ongoing refinement as the product evolves.

## Troubleshooting

- If the backend fails to start, verify that Postgres and Neo4j are reachable and that the `.env` values are valid. `GET /debug/neo4j` helps isolate graph connectivity issues.
- If the frontend cannot contact the API, confirm that `VITE_API_URL` points at the backend and that the backend is running on port 8000.
- If migrations fail, check the Postgres connection strings and ensure the database user has permission to create tables.
- If generation stalls after the draft, the pipeline is likely paused at the human-review interrupt — open the review URL for that thread to resume it.

## License

MIT — see [LICENSE](LICENSE).

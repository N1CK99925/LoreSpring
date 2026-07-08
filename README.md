# LoreSpring
![alt text](image.png)
LoreSpring is a full-stack storytelling platform for generating, reviewing, and refining long-form narrative chapters with the help of an LLM-driven multi-agent pipeline and a persistent story memory graph.

The product is built around a simple authoring loop:

1. Create a story project.
2. Describe the next chapter direction.
3. Generate a chapter draft through the backend pipeline.
4. Review and approve or reject the draft.
5. Persist the accepted chapter and expand the story memory graph for future chapters.

## What the project does

LoreSpring combines:

- A FastAPI backend for authentication, project management, chapter generation, review, and graph endpoints.
- A LangGraph-based generation pipeline with specialized agents for writing, continuity checking, revision, summarization, human review, and lore persistence.
- A LightRAG-style memory layer that indexes completed chapters into persistent storage for later retrieval.
- A React + TypeScript + Vite frontend for the project dashboard, chapter editor, review flow, and story graph visualization.

## Architecture at a glance

### Backend

The backend lives under [api](api) and [src](src).

- [api/main.py](api/main.py) creates the FastAPI app, wires CORS, and initializes the LangGraph checkpointer and graph service.
- [api/routes](api/routes) exposes the main HTTP endpoints for auth, projects, generation, review, chapters, health, and graph visualization.
- [src/graph](src/graph) defines the LangGraph workflow and state model that orchestrates the chapter-generation pipeline.
- [src/agents](src/agents) contains the individual agents:
  - writer: generates a draft chapter
  - continuity: checks for logical contradictions against prior lore
  - revision: scores the draft and requests rewrites when needed
  - summarizer: creates chapter summaries and structured plot memory
  - human_review: pauses for human approval
  - lore_keeper: indexes accepted chapters into the memory system

### Data and memory layer

The application uses several persistence layers:

- PostgreSQL for users, projects, chapters, and chapter summaries.
- Neo4j for graph storage used by the lore memory layer.
- Local project storage under [lore_db](lore_db) for LightRAG-related artifacts and indexes.
- SQLAlchemy async models are defined in [database](database).

### Frontend

The frontend lives under [frontend](frontend) and uses React, TypeScript, and Vite.

- [frontend/src/pages](frontend/src/pages) contains the dashboard, project page, review page, login/register screens, and graph page.
- [frontend/src/api](frontend/src/api) wraps the backend API calls.
- [frontend/src/components](frontend/src/components) contains reusable UI pieces such as the project modal and sidebar.

## Repository layout

- [api](api) — FastAPI application and routes
- [config](config) — runtime settings and environment loading
- [database](database) — SQLAlchemy models and session management
- [frontend](frontend) — React/Vite client application
- [src/agents](src/agents) — LLM-powered narrative agents
- [src/graph](src/graph) — LangGraph workflow and narrative state
- [src/llm](src/llm) — LLM client wiring and prompt helpers
- [src/memory](src/memory) — LightRAG and embedding integration
- [src/schemas](src/schemas) — request/response and agent payload schemas
- [src/services](src/services) — service layer for projects, chapters, graph storage, auth, and persistence
- [alembic](alembic) — database migrations
- [lore_db](lore_db) — persisted lore memory artifacts

## Core user flow

1. Register or log in.
2. Create a project with genre, tone, and style.
3. Open a project and provide a chapter direction.
4. Generate a chapter draft.
5. Review the generated draft in the review screen.
6. Approve to persist the chapter, or reject to discard it and regenerate.
7. Explore the resulting story graph from the graph view.

## Prerequisites

You will need:

- Python 3.11+
- Node.js 18+
- PostgreSQL access
- A Groq API key
- Access to a Neo4j instance for the graph-backed memory layer

## Environment configuration

Create a file named .env at the repository root and provide the values below.

```env
GROQ_API_KEY=your_groq_key
POSTGRES_URL=postgresql+asyncpg://user:password@host:5432/dbname
POSTGRES_URL_SYNC=postgresql+psycopg://user:password@host:5432/dbname
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
JINA_API_KEY=your_jina_key

# Optional observability
LANGSMITH_TRACING=false
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT=lorespring

# Optional frontend API override for local development
VITE_API_URL=http://localhost:8000
```

Notes:

- The backend reads configuration from [config/settings.py](config/settings.py).
- The app expects both async and sync PostgreSQL connection strings because the backend uses async SQLAlchemy while Alembic and startup tasks need a sync-capable connection.
- The project is currently wired for managed or external Postgres and Neo4j services rather than local-only containers.

## Local development

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn api.main:app --reload
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

The container entrypoint runs Alembic migrations before starting the FastAPI app.

## Database migrations

Migrations are managed with Alembic.

```bash
alembic upgrade head
```

If you add or change the SQLAlchemy models under [database/models](database/models), generate a new migration with:

```bash
alembic revision --autogenerate -m "describe your change"
```

## API overview

### Authentication

- POST /auth/register
- POST /auth/login
- POST /auth/logout

### Projects

- POST /projects
- GET /projects
- GET /projects/{project_id}

### Chapters

- GET /chapters/{project_id}

### Generation

- POST /generate

### Review

- GET /review/{thread_id}
- POST /resume/{thread_id}

### Graph

- GET /graph?project_id=...

## How the generation pipeline works

When a chapter is generated, the app runs a LangGraph workflow that performs the following steps:

1. The writer agent creates an initial draft from the project metadata, chapter direction, and prior summaries.
2. The continuity agent checks the draft for contradictions against previously established lore.
3. The revision agent scores the draft and may trigger rewrites until the minimum quality threshold is met or the revision limit is reached.
4. The summarizer agent produces structured summary data for future context.
5. The human review step pauses for approval.
6. If approved, the lore keeper indexes the chapter into the story memory layer and the chapter is saved to PostgreSQL.

## Development notes

- The project is intentionally backend-first and uses structured memory to improve continuity across chapters.
- The frontend is currently focused on the core authoring loop rather than a full publishing workflow.
- Some parts of the repository still contain TODOs or experimental hooks, so expect ongoing refinement as the product evolves.

## Troubleshooting

- If the backend fails to start, verify that Postgres and Neo4j are reachable and that the .env values are valid.
- If the frontend cannot contact the API, confirm that VITE_API_URL points to the backend URL and that the backend is running on port 8000.
- If migrations fail, check the PostgreSQL connection strings and ensure the database user has permission to create tables.

## License

This repository does not currently declare a license file. If you plan to redistribute or reuse the project publicly, add an explicit license before deployment.

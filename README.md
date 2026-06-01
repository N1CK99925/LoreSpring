LoreSpring — knowledge-graph backed narrative generation
ts readme was written by ai, is wrong need to change

<img src="image.png" alt="LoreSpring" style="max-width:320px; height:auto;" />


Overview
--------
LoreSpring is a backend-first platform that combines a modular multi-agent LLM pipeline with a persistent knowledge graph to generate, validate, and refine long-form narrative content. The system emphasizes reproducible state (PostgreSQL + GraphML stores), incremental revisions, and a human-in-the-loop review step before persisting canonical lore.

Core pipeline
-------------
1. Ingest: user project metadata and generation prompts are recorded in the API and persisted to the project store.
2. Draft generation: a `Writer` agent invokes the configured LLM (Groq client by default) with contextual inputs (project state, recent chapters, extracted entities).
3. Consistency & validation: a `Continuity` agent checks the draft against the knowledge graph for contradictions and missing references; it tags and extracts entities.
4. Revision loop: a `Revision` agent scores quality and requests iterative rewrites from the `Writer` until thresholds or max iterations are reached.
5. Summarize & embed: accepted drafts are summarized and key entities are encoded into vector embeddings; GraphML and vector stores in `lore_db` are updated.
6. Human review & commit: an explicit human approval step (review UI) gates final writes performed by the `Lore Keeper`, which updates the canonical graph and database checkpoints.

Repository layout (high level)
------------------------------
- `api/` — FastAPI application and HTTP routes (auth, projects, generate, review, graph_viz).
- `src/agents/` — agent implementations (writer, revision, continuity, summarizer, lore_keeper, human_review).
- `graph/` — graph construction and pipeline orchestration utilities.
- `llm/` — LLM client integration (Groq), prompts and request helpers.
- `services/` — adapters for Postgres, Neo4j, Pinecone/vector DB, and other external services.
- `frontend/` — React + TypeScript UI.
- `lore_db/` — persisted GraphML and on-disk vector/metadata stores used for reproducible runs.

Quick start (development)
-------------------------
Prerequisites: Python 3.10+, Node.js 18+, PostgreSQL (or container), optional vector DB (Pinecone) and Neo4j when enabled.

Backend (development)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env  # set GROQ_API_KEY, POSTGRES_URL, other secrets
alembic upgrade head
uvicorn api.main:app --reload
```

Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Docker
------
The compose configuration reads container environment variables from a top-level `.env` file. Ensure you have a `.env` file at the repository root with production or development values (do not commit secrets).

Build and start services:

```bash
docker compose up --build
```

To stop and remove containers: `docker compose down -v`.

Using cloud-hosted databases
---------------------------
This repository is configured to use cloud-hosted Postgres (Neon) and Neo4j (Aura) by default. Local DB containers were removed from the compose configuration.

1. Ensure `.env` contains your cloud DB connection strings (`POSTGRES_URL`, `POSTGRES_URL_SYNC`, `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`).

2. Start backend and frontend containers (no local DBs):

```bash
docker compose up --build backend frontend
```

Notes:
- `POSTGRES_URL` must use the `asyncpg` driver for async DB access (SQLAlchemy async). Example: `postgresql+asyncpg://user:pass@ep-.../dbname`.
- For Neo4j Aura use the `neo4j+s://` scheme (TLS) and supply `NEO4J_USER` and `NEO4J_PASSWORD`.
- Ensure your cloud DB allows connections from the host running Docker (IP allowlist / VPC connectors as required).

Migrations
----------
On container startup the backend will attempt to run Alembic migrations before launching the app. This is performed by the image entrypoint and executes:

```bash
alembic upgrade head
```

Requirements:
- `POSTGRES_URL_SYNC` (sync connection string) must be present in `.env` and reachable by the container so Alembic can connect.
- `alembic` is included in `requirements.txt` and therefore available in the image built from the provided `Dockerfile`.

If you prefer to manage migrations outside containers (CI/CD or manual runs), you can change the `Dockerfile` ENTRYPOINT or run the container with `--entrypoint` to skip migrations.

Operational notes
-----------------
- Environment variables: `GROQ_API_KEY`, `POSTGRES_URL` (async), `POSTGRES_URL_SYNC`, `SECRET_KEY`.
- External services: vector DB (Pinecone/compatible), optional Neo4j for richer graph queries, and PostgreSQL for transactional state.
- Persistent graph artifacts are stored under `lore_db/` (GraphML + JSON indexes) to allow offline inspection and reproducible pipeline runs.

Developer pointers
------------------
- Primary pipeline entry points: `api/routes/generate.py`, `src/agents/` and `graph/pipeline.py`.
- LLM integration: `llm/groq_client.py` and `llm/prompts.py`.
- Storage adapters: `services/postgres.py`, `services/neo4j.py`, `services/pinecone.py`.

If you need a brief walkthrough of how a specific component (for example, the embedding flow or the review UI) works, open an issue or request a short doc update in the repository.

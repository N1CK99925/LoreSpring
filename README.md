# 🌿 LoreSpring

Multi-Agent narrative generation with lore memory and human review loop.

## Overview

AI-powered story generation platform with FastAPI backend, React frontend, and LangGraph orchestration. Maintains narrative consistency across chapters using knowledge graphs and specialized agents.

## Features

- Multi-agent orchestration (Writer, Revision, Continuity, Summarizer, Lore Keeper, Human Review)
- Knowledge graph with GraphML + vector embeddings
- Iterative refinement with quality scoring
- PostgreSQL checkpointing for state resumption
- JWT authentication with project isolation
- React UI with graph visualization
- Human-in-the-loop approval workflow

---

## 🏗️ Architecture

```
Backend (FastAPI + LangGraph)     Frontend (React + TS)       Storage
├── api/routes/                    ├── pages/                ├── PostgreSQL
│   ├── auth.py                   │   ├── Login.tsx         ├── lore_db/
│   ├── projects.py               │   ├── Dashboard.tsx     │   └── GraphML
│   ├── chapters.py               │   ├── Project.tsx       └── Vector DB
│   ├── generate.py               │   ├── GraphPage.tsx
│   ├── review.py                 │   └── Review.tsx
│   └── graph_viz.py              ├── api/
├── src/agents/                   ├── components/
│   ├── writer.py                 └── hooks/
│   ├── revision.py
│   ├── continuity.py
│   ├── summarizer.py
│   ├── lore_keeper.py
│   └── human_review.py
└── src/graph/
    ├── main.py
    └── pipeline.py
```

---

## 🤖 Agents

**Writer** - Generates drafts from user direction + lore context
**Revision** - Assesses quality and proposes improvements
**Continuity** - Validates lore consistency and detects conflicts
**Summarizer** - Creates chapter summaries for context
**Human Review** - Interrupt for user approval/rejection
**Lore Keeper** - Updates knowledge graph with new entities

---

## 🔄 Pipeline Flow

```
User Input → WRITER → CONTINUITY → REVISION
                ↓         ↓           ↓
          quality_score < threshold?
                ↓
            YES → WRITER (revise, max N times)
            NO → SUMMARIZER
                ↓
        HUMAN REVIEW [INTERRUPT]
        User: Approve? / Reject?
                ↓
            APPROVE → LORE KEEPER → Done
            REJECT → WRITER (revise)
```

---

## 🛠️ Tech Stack

**Backend**: FastAPI, LangGraph, Groq LLM, SQLAlchemy, PostgreSQL, LightRAG, Sentence Transformers
**Frontend**: React 19, TypeScript, Tailwind CSS, Vite, react-force-graph-2d
**Infrastructure**: Docker, PostgreSQL, Uvicorn, asyncpg

---

## 🚀 Quick Start

**Backend Setup**
```bash
git clone https://github.com/yourusername/lorespring.git
cd lorespring
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit with GROQ_API_KEY, POSTGRES_URL
alembic upgrade head
uvicorn api.main:app --reload
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**Database (Docker)**
```bash
docker run --name lorespring-db -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:15
```

---

## 📚 Usage

1. **Register** - Create account at `/register`
2. **Create Project** - Provide title, genre, tone, style
3. **Generate Chapter** - Set chapter number, write direction (e.g., "Sera discovers the hidden map"), adjust quality threshold (0-10) and max revisions
4. **Review** - Approve or reject generated chapter
5. **View Graph** - Click ⬡ Graph to see entity relationships
6. **Browse Chapters** - Select from left sidebar to view full text

---

## 🔌 API Endpoints

```
POST   /auth/register, /auth/login
POST   /projects, GET /projects, GET /projects/{id}
GET    /chapters/{project_id}
POST   /generate (trigger pipeline)
GET    /review/{thread_id}, POST /resume/{thread_id}
GET    /graph?project_id={id}
```

---

## � Environment Variables

```env
GROQ_API_KEY=gsk_...
POSTGRES_URL=postgresql+asyncpg://user:pass@localhost/lorespring
POSTGRES_URL_SYNC=postgresql://user:pass@localhost/lorespring
SECRET_KEY=<32-byte-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Project ID not found" in Graph | Ensure route is `/graph/:projectId` |
| "Generation failed" error | Check GROQ_API_KEY and quota |
| PostgreSQL connection refused | Verify POSTGRES_URL and database is running |
| Token expired | Clear localStorage and re-authenticate |

---

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by MEEEE **
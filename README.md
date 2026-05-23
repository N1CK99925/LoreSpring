# LoreSpring


A Multi-Agent System with Lore-Aware Memory for Maintaining Long-Term Coherence in Narrative Generation.

## Overview

LoreSpring is a narrative generation system that uses multiple AI agents in a coordinated graph-based workflow to create coherent stories. The system maintains lore consistency through a local knowledge graph and employs specialized agents for writing, revision, continuity checking, summarization, and lore management.

## Key Features

- **Multi-Agent Architecture**: Specialized agents handle different aspects of narrative generation
- **Lore-Aware Memory**: Local knowledge graph system for maintaining consistency across chapters
- **Iterative Refinement**: Built-in revision cycles with continuity and quality checks
- **Graph-Based Workflow**: LangGraph orchestration for agent coordination
- **Local Storage**: JSON-based persistence for lore and chapter data

## Architecture

```
lore-spring/
├── api/                 # FastAPI application
│   ├── main.py         # FastAPI app initialization
│   ├── websocket.py    # WebSocket handlers
│   └── routes/         # API endpoints
│       ├── generate.py # Chapter generation endpoints
│       ├── health.py   # Health check endpoints
│       └── review.py   # Review and revision endpoints
├── auth/                # Authentication & security
│   └── hashing.py      # Password hashing utilities
├── database/            # Database management
│   ├── base.py         # SQLAlchemy declarative base
│   ├── session.py      # Database session management
│   └── models/         # ORM models
│       └── chapter.py  # Chapter model
├── src/
│   ├── agents/          # Agent implementations
│   │   ├── writer.py    # Initial draft generation
│   │   ├── revision.py  # Content revision and quality assessment
│   │   ├── continuity.py # Lore consistency validation
│   │   ├── summarizer.py # Chapter summarization
│   │   ├── lore_keeper.py # Lore database updates
│   │   ├── quality.py   # Quality assessment
│   │   ├── human_review.py # Human review workflow
│   │   └── utils.py     # Shared utilities
│   ├── graph/           # Workflow orchestration
│   │   ├── state.py     # NarrativeState definition
│   │   ├── main.py      # StateGraph setup and compilation
│   │   ├── pipeline.py  # Graph pipeline management
│   │   └── subgraphs.py # Subgraph implementations
│   ├── memory/          # Memory management
│   │   ├── lightrag.py  # LightRAG integration
│   │   └── embedding.py # Sentence transformer embeddings
│   ├── schemas/         # Data models
│   │   ├── lore.py      # Lore data structures
│   │   ├── continuity.py # Continuity check results
│   │   ├── revision.py  # Revision feedback
│   │   ├── summarizer.py # Summary formats
│   │   └── api/         # API schemas
│   │       ├── generation_request.py
│   │       └── generation_response.py
│   ├── services/        # External service integrations
│   │   ├── neo4j.py     # Neo4j graph database
│   │   ├── pinecone.py  # Pinecone vector store
│   │   └── postgres.py  # PostgreSQL database
│   └── llm/             # Language model interfaces
│       ├── groq_client.py # Groq API client
│       └── prompts.py   # Prompt templates
├── config/              # Configuration management
│   └── settings.py      # Pydantic settings
├── alembic/             # Database migrations
│   ├── env.py           # Migration environment setup
│   ├── versions/        # Migration scripts
│   │   ├── 66dd3f3870f4_init.py # Initial schema
│   │   └── 407d26302ee2_timezone_fix.py # Timezone updates
│   └── script.py.mako   # Migration template
├── lore_db/             # Local knowledge graph storage
│   ├── *.json          # Key-value stores
│   ├── *.graphml       # Graph structure
│   └── vdb_*.json      # Vector databases
├── alembic.ini         # Alembic configuration
├── memory.json         # Chapter memory store
├── requirements.txt    # Python dependencies
├── Dockerfile          # Container deployment
└── README.md           # This file
```

## Agents

### Writer Agent
Generates initial narrative drafts based on:
- Previous chapter summaries
- User direction and metadata
- Lore context from knowledge graph
- Revision feedback and continuity issues

### Revision Agent
Reviews drafts for:
- Plot coherence and pacing
- Character development
- Prose clarity and style
- Prompt adherence
- Provides quality scores (0-10) across multiple dimensions

### Continuity Agent
Validates lore consistency by checking:
- Character traits and relationships
- Location descriptions and rules
- Object properties and holders
- Timeline coherence against established facts

### Summarizer Agent
Creates structured chapter summaries including:
- Key events and plot progression
- Character developments and updates
- Lore changes and new information

### Lore Keeper Agent
Updates the knowledge graph with new information from completed chapters:
- Inserts chapter content into LightRAG
- Maintains evolving lore database

## Memory System

LoreSpring uses LightRAG for lore-aware memory:

- **Knowledge Graph**: Stores entities (characters, locations, objects) and relationships
- **Vector Embeddings**: Semantic search using Sentence Transformers
- **Local Storage**: JSON files for persistence (lore_db/)
- **Hybrid Querying**: Combines keyword and semantic search
- **Dynamic Updates**: Lore evolves with each generated chapter

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lore-spring.git
   cd lore-spring
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Unix/Mac:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   Create a `.env` file with required API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   # Optional LangSmith tracing:
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
   LANGCHAIN_API_KEY=your_langsmith_key
   LANGCHAIN_PROJECT=your_project_name
   ```

## Usage

### Running the Graph Directly

Execute the main narrative generation workflow:

```bash
python -m src.graph.main
```

This runs the complete agent pipeline:
1. Writer generates initial draft
2. Revision agent reviews and scores quality
3. Continuity agent checks lore consistency
4. Summarizer creates chapter summary
5. Lore Keeper updates knowledge graph

### Running the FastAPI Server

Start the API server for HTTP and WebSocket access:

```bash
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

#### API Endpoints

- **POST /api/generate** - Generate a new chapter with given parameters
- **GET /api/health** - Health check endpoint
- **POST /api/review** - Submit chapter for review and revision
- **WebSocket /ws** - Real-time streaming of chapter generation

### Memory Management

The system maintains memory in:
- `memory.json`: Chapter summaries and key events
- `lore_db/`: LightRAG knowledge graph files

## Configuration

### Database Setup

LoreSpring uses Alembic for database migrations. To set up the database:

```bash
# Create a new database migration
alembic revision --autogenerate -m "Description of changes"

# Apply all pending migrations
alembic upgrade head

# Rollback to previous migration
alembic downgrade -1
```

Currently supported migrations:
- Initial schema setup (66dd3f3870f4_init.py)
- Timezone fixes (407d26302ee2_timezone_fix.py)

Update `sqlalchemy.url` in `alembic.ini` to point to your database (PostgreSQL, MySQL, etc.).

### Narrative State

The system uses a typed state dictionary (`NarrativeState`) containing:

- `project_id`: Unique project identifier
- `chapter_number`: Current chapter being generated
- `user_direction`: User-provided writing instructions
- `metadata`: Genre, style, and other settings
- `lore_context`: Retrieved relevant lore facts
- `draft`: Current chapter draft
- `revision_count`: Number of revision iterations
- `continuity_issues`: Detected consistency problems
- `revision_result`: Quality assessment and feedback
- `final_chapter`: Completed chapter text
- `chapter_summary`: Structured summary

### Quality Assessment

The revision agent evaluates drafts on:
- **Pacing**: Scene rhythm and timing
- **Character Depth**: Psychological complexity
- **Prose Clarity**: Writing precision and style
- **Tension**: Dramatic buildup
- **Prompt Adherence**: Following user direction

Scores range from 0-10, with most drafts scoring 5-7.

## Dependencies

Core dependencies include:

- **LangGraph**: Graph-based workflow orchestration
- **LangChain-Groq**: Groq LLM integration
- **LightRAG**: Knowledge graph memory system
- **Sentence Transformers**: Text embeddings
- **Pydantic**: Data validation and settings
- **LangSmith**: Optional tracing and monitoring
- **FastAPI**: Web framework for REST API
- **Uvicorn**: ASGI server for FastAPI
- **SQLAlchemy**: ORM for database access
- **Alembic**: Database migration tool
- **python-multipart**: Form data parsing

## Development Status

### Implemented
- Core agent pipeline (Writer, Revision, Continuity, Summarizer, Lore Keeper)
- Quality agent for content assessment
- Human review workflow agent
- LightRAG knowledge graph integration
- Local JSON-based persistence
- Groq LLM client with retry logic
- Structured data schemas and API schemas
- Configuration management via Pydantic
- FastAPI REST application structure
- WebSocket streaming support
- Authentication layer with password hashing
- Database models (Chapter) and ORM setup
- Alembic database migrations (versioned)
- Service integration stubs (Neo4j, Pinecone, PostgreSQL)

### In Progress
- API endpoints expansion (generate, health, review routes)
- WebSocket full integration for real-time streaming
- Database integration with PostgreSQL via Alembic
- Complete containerization (Dockerfile)

### Not Yet Implemented
- External database integrations (Neo4j, Pinecone, PostgreSQL production setup)
- Comprehensive test suite
- Advanced subgraphs for complex workflows
- Prompt template management system
- Deployment pipeline (CI/CD)

## Roadmap

- [x] Implement dedicated Quality agent
- [x] Add FastAPI REST endpoints structure
- [x] Implement WebSocket infrastructure
- [x] Add database models and ORM setup
- [x] Setup Alembic for database migrations
- [ ] Complete all FastAPI endpoints (generate, review, status)
- [ ] Full WebSocket streaming implementation
- [ ] PostgreSQL production deployment
- [ ] Add external database support (Neo4j, Pinecone)
- [ ] Create comprehensive test suite
- [ ] Implement advanced subgraphs for workflows
- [ ] Add prompt template management system
- [ ] Complete Dockerfile and deploy pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper type hints
4. Test locally with the graph workflow
5. Submit a pull request

## License

[]

## Acknowledgments

- Built with LangGraph for agent orchestration
- Powered by Groq for fast LLM inference
- Memory system based on LightRAG
- Embeddings via Sentence Transformers



STREAMING IS NOT YET SUPPORTED 
<!-- Better Error handle on login -->
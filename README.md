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
├── src/
│   ├── agents/          # Agent implementations
│   │   ├── writer.py    # Initial draft generation
│   │   ├── revision.py  # Content revision and quality assessment
│   │   ├── continuity.py # Lore consistency validation
│   │   ├── summarizer.py # Chapter summarization
│   │   ├── lore_keeper.py # Lore database updates
│   │   ├── quality.py   # (Not implemented)
│   │   └── utils.py     # Shared utilities
│   ├── graph/           # Workflow orchestration
│   │   ├── state.py     # NarrativeState definition
│   │   ├── main.py      # StateGraph setup and compilation
│   │   └── subgraphs.py # (Not implemented)
│   ├── memory/          # Memory management
│   │   ├── lightrag.py  # LightRAG integration
│   │   └── embedding.py # Sentence transformer embeddings
│   ├── schemas/         # Data models
│   │   ├── lore.py      # Lore data structures
│   │   ├── continuity.py # Continuity check results
│   │   ├── revision.py  # Revision feedback
│   │   └── summarizer.py # Summary formats
│   ├── services/        # (Not implemented)
│   │   ├── neo4j.py
│   │   ├── pinecone.py
│   │   └── postgres.py
│   └── llm/             # Language model interfaces
│       ├── groq_client.py # Groq API client
│       └── prompts.py    # (Empty)
├── config/              # Configuration management
│   └── settings.py      # Pydantic settings
├── lore_db/             # Local knowledge graph storage
│   ├── *.json          # Key-value stores
│   ├── *.graphml       # Graph structure
│   └── vdb_*.json      # Vector databases
├── memory.json         # Chapter memory store
├── requirements.txt    # Python dependencies
├── Dockerfile          # (Incomplete)
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

### Running the Graph

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

### Memory Management

The system maintains memory in:
- `memory.json`: Chapter summaries and key events
- `lore_db/`: LightRAG knowledge graph files

## Configuration

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

## Development Status

### Implemented
- Core agent pipeline (Writer, Revision, Continuity, Summarizer, Lore Keeper)
- LightRAG knowledge graph integration
- Local JSON-based persistence
- Groq LLM client with retry logic
- Structured data schemas
- Basic configuration management

### Not Yet Implemented
- Quality agent (separate from revision)
- API endpoints (FastAPI)
- WebSocket streaming
- External database integrations (Neo4j, Pinecone, PostgreSQL)
- Test suite
- Subgraphs for complex workflows
- Prompt templates
- Containerization (Dockerfile)

## Roadmap

- [ ] Implement dedicated Quality agent
- [ ] Add FastAPI REST endpoints
- [ ] Implement WebSocket streaming for real-time generation
- [ ] Add external database support
- [ ] Create comprehensive test suite
- [ ] Implement subgraphs for advanced workflows
- [ ] Add prompt template management
- [ ] Complete Dockerfile for deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper type hints
4. Test locally with the graph workflow
5. Submit a pull request

## License

[Specify your license here]

## Acknowledgments

- Built with LangGraph for agent orchestration
- Powered by Groq for fast LLM inference
- Memory system based on LightRAG
- Embeddings via Sentence Transformers
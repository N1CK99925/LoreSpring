 # LoreSpring 



# A Self-Evolving Multi-Agent System for Consistent Long-Form Narrative Generation with Lore-Aware Memory


The goal is to support **long-form, consistent, lore-aware storytelling** with clean abstractions for memory, LLM interaction, and agents.



---

# LoreSpring v1.0

**An AI-powered multi-agent story generation system that creates consistent, long-form narratives using specialized agents.**

LoreSpring uses a collaborative agent architecture where a Planner designs story arcs, a Writer crafts prose, and a Critic ensures quality—all while maintaining narrative consistency through vector-based memory storage.

---

## 🌟 Features

- **Multi-Agent Architecture**: Specialized agents for planning, writing, and quality control
- **Narrative Memory**: Vector database (ChromaDB) stores and retrieves story context
- **Persistent State**: Tracks characters, plot threads, and world state across chapters
- **Configurable LLM Backends**: Supports Groq and Google Gemini
- **Semantic Chunking**: Intelligent text splitting for optimal context retrieval
- **Structured Output**: JSON-based communication between agents

---

##  Architecture

```
┌─────────────────────────────────────────────────┐
│           Agent Coordinator                     │
│  Orchestrates the story generation workflow     │
└──────────┬──────────────┬──────────────┬────────┘
           │              │              │
    ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼─────┐
    │  Planner   │ │  Writer    │ │  Critic  │
    │  Agent     │ │  Agent     │ │  Agent   │
    └──────┬─────┘ └─────┬──────┘ └────┬─────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                   ┌──────▼──────┐
                   │   Memory    │
                   │   Manager   │
                   └──────┬──────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
    ┌────▼────┐                      ┌─────▼─────┐
    │ Vector  │                      │  Story    │
    │ Store   │                      │  State    │
    │(Chroma) │                      │  (JSON)   │
    └─────────┘                      └───────────┘
```

### Agent Roles

**Planner Agent**
- Analyzes current story state
- Retrieves context from past chapters
- Designs chapter structure and scene plans
- Sets narrative constraints and objectives

**Narrative Agent**
- Receives structured plan from Planner
- Retrieves relevant context from memory
- Writes actual story prose
- Returns scene text with metadata

**Consistency Agent**
- Validates narrative coherence (planned)
- Checks for lore contradictions (planned)
- Ensures character consistency (planned)

**Memory Manager**
- Stores narrative chunks with embeddings
- Performs semantic search for context retrieval
- Manages persistent story state
- Tracks plot threads and character states

---

## 📋 Prerequisites

- **Python**: 3.9 or higher
- **API Keys**: 
  - Groq API key (recommended) OR Google Gemini API key
- **Disk Space**: ~500MB for embedding models and vector database

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LoreSpring.git
cd LoreSpring
```

### 2. Create Virtual Environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# .env
GROQ_API_KEY=your_groq_api_key_here
# OR
GOOGLE_API_KEY=your_google_api_key_here
```

**Get API Keys:**
- Groq: https://console.groq.com/keys (Free tier available)
- Google Gemini: https://makersuite.google.com/app/apikey

### 5. Configure System Settings

Edit `config/system_config.yaml`:

```yaml
llm:
  provider: "groq"  # or "gemini"
  model: "llama-3.1-8b-instant"
  temperature: 0.7
  max_tokens: 2048

embeddings:
  provider: "sentence_transformers"
  model: "all-MiniLM-L6-v2"

vector_memory:
  provider: "chromadb"
  n_results: 5
```

### 6. Set Up Lore Rules

Edit `config/lore_rules.yaml` to define your story world:

```yaml
world_name: "Aethermoor"
magic_system:
  type: "elemental"
  rules:
    - "Magic requires verbal incantations"
    - "Elemental affinities are inherited"
    
characters:
  - name: "Eryndor"
    role: "protagonist"
    abilities: ["fire magic", "swordsmanship"]
    
  - name: "Aria"
    role: "mentor"
    abilities: ["wind magic", "healing"]

locations:
  - name: "Thornhaven"
    type: "city"
    description: "A bustling merchant city"
```

---

## 🎮 Usage

### Basic Usage

Run the story generator:

```bash
python -m src.main
```

This will:
1. Initialize all agents and memory systems
2. Load previous story state (if exists)
3. Generate the next chapter
4. Save narrative to vector database
5. Update story state

### Output

Generated stories are stored in:
- **Vector Database**: `data/memory/vector_db/` (for semantic retrieval)
- **Story State**: `data/memory/story_state.json` (tracks progress)
- **Logs**: Console output with detailed agent activity

### Example Output

```
[01:02:32] INFO - Agent Coordinator Initialized
[01:02:32] INFO - Agent planner_agent generating response for prompt.
[01:02:33] INFO - LLMClient (groq) generation successful
[01:02:34] INFO - Agent narrative_agent retrieving context for query: The Market Encounter
[01:02:34] INFO - Agent narrative_agent generating response for prompt.
[01:02:34] INFO - LLMClient (groq) generation successful
[01:02:34] INFO - Storing chapter 4 narrative
[01:02:34] INFO - Stored 1 chunks for chapter 4
[01:02:34] INFO - Successfully completed Chapter 4.
```

---

## 📁 Project Structure

this might be a lildifferent
```
LoreSpring/
├── config/
│   ├── agent_config.yaml       # Agent-specific configurations
│   ├── lore_rules.yaml         # World-building rules and lore
│   ├── memory_config.yaml      # Vector store settings
│   └── system_config.yaml      # LLM and embedding settings
├── data/
│   └── memory/
│       ├── vector_db/          # ChromaDB storage (auto-created)
│       └── story_state.json    # Persistent story state (auto-created)
├── prompts/
│   ├── planner_agent.txt       # Planner system prompt
│   ├── narrative_agent.txt     # Writer system prompt
│   └── consistency_agent.txt   # Critic system prompt
├── src/
│   ├── agents/
│   │   ├── BaseAgent.py        # Abstract base class for agents
│   │   ├── PlannerAgent.py     # Story planning agent
│   │   ├── NarrativeAgent.py   # Prose writing agent
│   │   └── ConsistancyAgent.py # Quality control agent
│   ├── communication/
│   │   └── agent_coordinator.py # Orchestrates agent workflow
│   ├── memory/
│   │   ├── Memory_Manager.py   # Central memory management
│   │   ├── Story_State.py      # Persistent story tracking
│   │   └── vector_store.py     # ChromaDB wrapper
│   ├── models/
│   │   ├── chunking.py         # Text chunking utilities
│   │   ├── embeddings.py       # Embedding generation
│   │   └── llm_interface.py    # LLM client wrapper
│   ├── utils/
│   │   ├── file_io.py          # YAML/config loading
│   │   └── logger.py           # Logging configuration
│   └── main.py                 # Entry point
├── .env                        # API keys (create this)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Configuration

### Agent Configuration (`config/agent_config.yaml`)

```yaml
agents:
  planner_agent:
    role: "story_planner"
    max_context_chunks: 5
    
  narrative_agent:
    role: "prose_writer"
    max_context_chunks: 5
    
  consistency_agent:
    role: "quality_checker"
    max_context_chunks: 3
```

### Memory Configuration (`config/memory_config.yaml`)

```yaml
vector_memory:
  provider: "chromadb"
  collection_name: "narrative_memory"
  n_results: 5
  distance_metric: "cosine"

chunking:
  chunk_size: 800
  chunk_overlap: 100
  separators: ["\n\n", "\n", " "]
```

---

## 🔧 Advanced Usage

### Custom Story Worlds

1. Create a new lore file: `config/my_world_lore.yaml`
2. Update `PlannerAgent.process_task()` to load your lore file:

```python
lore_rules = load_yaml_config("my_world_lore.yaml")
```

### Adjusting Chapter Length

Edit the planner prompt (`prompts/planner_agent.txt`):

```
"target_total_words": 3000,  # Change this value
```

### Multiple Story Projects

Use different vector database directories:

```python
# In vector_store.py
self.client = chromadb.PersistentClient(
    path="./data/memory/project_name_vector_db"
)
```

---

## 🐛 Troubleshooting

### Error: `TypeError: unsupported format string passed to NoneType.__format__`

**Cause**: Multiple MemoryManager instances or missing chapter_number

**Fix**: Ensure you're running the latest version with the singleton pattern fix

### Error: `No module named 'groq'` or `'google.generativeai'`

**Fix**: Install missing dependencies
```bash
pip install groq google-generativeai
```

### Error: `chromadb.errors.InvalidCollectionException`

**Fix**: Delete and reinitialize vector database
```bash
rm -rf data/memory/vector_db
python -m src.main
```

### Slow First Run

**Cause**: Downloading embedding model (~90MB) on first use

**Solution**: Wait for download to complete (one-time only)

### Poor Story Quality

**Adjust these settings:**
- Increase `temperature` in `system_config.yaml` for more creativity
- Increase `max_tokens` for longer responses
- Improve prompts in `prompts/` directory
- Add more detailed lore in `lore_rules.yaml`

---

## 📊 Performance

### Generation Times (Approximate)

| Component | Time | Notes |
|-----------|------|-------|
| First-time setup | 30-60s | Downloads embedding model |
| Chapter planning | 2-5s | LLM generates plan |
| Chapter writing | 3-8s | LLM generates prose |
| Memory storage | <1s | Embedding + vector store |
| **Total per chapter** | **5-15s** | Depends on LLM provider |

### Resource Usage

- **RAM**: ~2GB (embedding model + vector DB)
- **Disk**: ~500MB (models + vector database)
- **Network**: Minimal (only LLM API calls)

---

## 🛣️ Roadmap

### v1.1 (Planned)
- [ ] Fix memory singleton issue (critical)
- [ ] Add chapter number validation
- [ ] Improve error handling
- [ ] Add unit tests

### v2.0 (Future)
- [ ] Migrate to LangChain/LangGraph
- [ ] Add revision loops (Writer → Critic → Writer)
- [ ] Parallel scene generation
- [ ] Web UI for story management
- [ ] Export to EPUB/PDF

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LLM Providers**: Groq for fast inference, Google for Gemini API
- **Vector Database**: ChromaDB for efficient semantic search
- **Embeddings**: HuggingFace for sentence-transformers models
- **Inspiration**: Modern multi-agent AI systems and collaborative writing tools

---

## 📧 Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/LoreSpring](https://github.com/yourusername/LoreSpring)

---

## 🎯 Quick Start Example

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/LoreSpring.git
cd LoreSpring
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# 2. Install
pip install -r requirements.txt

# 3. Configure
echo "GROQ_API_KEY=your_key_here" > .env

# 4. Run
python -m src.main

# 5. Check output
cat data/memory/story_state.json
```

---

## ⚠️ Known Issues

1. **Memory Singleton Bug**: Current version creates multiple MemoryManager instances
   - **Impact**: Second run may fail with chapter_number error
   - **Workaround**: Restart the process after each chapter
   - **Status**: Fixed in development branch

2. **Relative Path Issues**: Some paths may break depending on execution directory
   - **Workaround**: Always run from project root: `python -m src.main`
   - **Status**: Will be fixed in v1.1

---

**Ready to generate stories? Get your API key and start creating! 🚀**


LightRAG for cheap better query



Need to add Multi Provider options when the pipeline works 

 # LoreSpring 



# A Self-Evolving Multi-Agent System for Consistent Long-Form Narrative Generation with Lore-Aware Memory


The goal is to support **long-form, consistent, lore-aware storytelling** with clean abstractions for memory, LLM interaction, and agents.

This README only documents the modules that are **already implemented**.

---

#  Implemented Components

---

## 1. VectorStore (ChromaDB)

### **Purpose**
Stores and retrieves narrative memory using vector similarity.

### **Features**
- Persistent **ChromaDB** collection
- Adds text chunks with metadata (`chapter`, `agent`, etc.)
- Prevents memory ID collisions
- Generates embeddings via the `Embeddings` module
- Performs semantic search (`top-k`)
- Fully driven by `memory_config.yaml`

---

## MemoryManager

### **Purpose**
Provides a unified interface for all memory operations in the system.

### **Features**
- Wraps VectorStore internally
- Methods:
  - `store_narrative(text, metadata)`
  - `get_narrative(query, n=5)`
- Ensures agents interact with memory in a consistent way
- Scalable design for future:
  - Temporal memory
  - Graph-based memory
  - Episodic memory

### **Why It Matters**
Agents should **never** directly touch Chroma or embeddings.  
MemoryManager serves as the **single source of truth** for all memory interactions.

---

##  3. Chunker (Text → Chunks)

### **Purpose**
Splits large text into small, overlapping chunks for embedding and retrieval.

### **Features**
- Uses `RecursiveCharacterTextSplitter`
- Configurable:
  - `chunk_size`
  - `chunk_overlap`
  - `separators`
- Validates inputs
- Supports:
  - `chunk_text(text)`
  - `chunk_documents([doc1, doc2, ...])`


It ensures the vector store doesn’t receive massive unstructured paragraphs.

---

##  4. Embeddings Module

### **Purpose**
Converts text into vector embeddings for the memory system.

### **Supported Providers**
- **Gemini** embeddings (`generativeai.EmbeddingModel`)
- **SentenceTransformers**

### **Features**
- Loads provider + model from `system_config.yaml`
- Methods:
  - `embed(text)`  
  - `embed_batch(chunks)`
- Clean abstraction so the rest of the system does not care about the backend provider



This module ensures flexible, pluggable embedding providers.

---

##  LLMClient (Unified LLM Interface)

### **Purpose**
Provides a single API for interacting with different LLM providers.

### **Supported Providers**
- **Gemini**
- **Groq**
- **Mock Mode** (no API calls, predictable outputs)

### **Features**
- Reads provider/model from `system_config.yaml`
- Handles:
  - load `.env` keys
  - retry logic (Tenacity)
  - JSON-mode responses
  - consistent message formatting
- Centralized logging

### **Why It Matters**
All agents rely on the same interface to communicate with LLMs.  
No agent needs to know:
- which API is used  
- how messages are formatted  
- how errors/retries work  

Everything is abstracted here.

---

##  BaseAgent Class

### **Purpose**
Defines the shared structure all agents must follow.

### **Features**
- Holds:
  - `llm = LLMClient()`
  - `memory = MemoryManager()`
  - `config = agent_config.yaml entry`
- Requires subclasses to implement:
  ```python
  async def process_task(self):
      pass




LightRAG for cheap better query



Need to add Multi Provider options when the pipeline works 
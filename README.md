<div align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python Version"/>
  <img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Database-Supabase-green.svg" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Queue-Redis-red.svg" alt="Redis"/>
  
  <h1>🧠 Distributed AI Researcher</h1>
  <p>An asynchronous, distributed Swarm Intelligence architecture designed for autonomous web research, data synthesis, and structured reporting.</p>
</div>

---

## 📖 Overview

The **Distributed AI Researcher** is an advanced autonomous research system. Rather than relying on a single blocking LLM call, it orchestrates a swarm of specialized AI agents that execute in parallel. By combining **LangGraph** for workflow routing, **FastAPI** for orchestration, and **Redis** for asynchronous job queuing, the system executes deep-dive internet research at scale without I/O bottlenecks.

## 🏗️ System Architecture

The application is decoupled into a frontend presentation layer and a persistent backend worker daemon, connected via a message broker. This ensures UI responsiveness even during long-running generative tasks.

```mermaid
graph TD
    %% Custom Styles
    classDef primary fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff,rx:6px
    classDef queue fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff,rx:6px
    classDef db fill:#16a34a,stroke:#15803d,stroke-width:2px,color:#fff,rx:6px
    classDef ai fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff,rx:6px
    classDef worker fill:#ea580c,stroke:#c2410c,stroke-width:2px,color:#fff,rx:6px

    %% Nodes
    Client["💻 Next.js Client"]:::primary
    API["⚡ FastAPI Orchestrator"]:::primary
    Redis[("🟥 Upstash Redis<br>(Queue & Cache)")]:::queue
    Supabase[("🟩 Supabase<br>(PostgreSQL)")]:::db

    %% Logical Grouping
    subgraph Backend ["⚙️ Background Processing"]
        Worker["Python Worker Daemon"]:::worker
        
        subgraph Swarm ["🧠 LangGraph AI Swarm"]
            Architect["🎯 Architect Agent<br>(Topic Breakdown)"]:::ai
            Scouts["🔍 Async Scouts<br>(Parallel DDGS)"]:::ai
            Synthesizer["✍️ Synthesizer Agent<br>(Markdown Generation)"]:::ai
            
            Architect ==>|Extract Sub-queries| Scouts
            Scouts ==>|Scraped Context| Synthesizer
        end
        Worker -->|Initiate Workflow| Architect
    end

    %% Data Flow
    Client -->|1. Submit Query| API
    API -->|2. Push Job| Redis
    Redis -->|3. BRPOP (Listen)| Worker
    
    Synthesizer -->|4a. Archive Report| Supabase
    Synthesizer -.->|4b. Cache Result| Redis
    
    Client -.->|5. Poll Status| API
    API -.->|6. Fetch Result| Redis
```

## 🛠️ Technology Stack

### Frontend
* **Framework:** Next.js 15
* **Styling:** TailwindCSS & React
* **Role:** Submits research topics and polls the backend for job completion, rendering the final synthesized Markdown reports.

### Backend Orchestration
* **API:** FastAPI (Python)
* **Message Broker:** Upstash Redis (Operating as a persistent, asynchronous job queue to prevent HTTP 504 timeouts).
* **Database:** Supabase (Standard PostgreSQL CRUD operations for permanent report archival and history).

### Swarm Intelligence (AI Agents)
The core reasoning engine leverages **LangGraph** and an asynchronous I/O model:

1. **The Architect Agent (LLaMA 3.3 via Groq):** 
   Receives the broad topic and utilizes strictly structured outputs (Pydantic models) to break the query down into 3 hyper-specific sub-queries.
   
2. **The Scout Agents (Async I/O):** 
   Utilizing `duckduckgo-search` and Python's `asyncio`, the system fires all scout requests concurrently. By replacing blocking synchronous loops with true parallel I/O, network latency is drastically minimized.
   
3. **The Synthesizer Agent (LLaMA 3.3 via Groq):** 
   Aggregates the concurrent findings from the scouts and synthesizes a singular, cohesive, professional Markdown document.

---

## 🚀 Deployment & Usage

### 1. Initialize the Backend
Ensure you have your environment variables set (`.env` file).
```bash
cd backend
pip install -r requirements.txt

# Start the FastAPI Orchestrator
python main.py
```
*(In a separate terminal, initialize the continuous queue worker):*
```bash
cd backend
python worker.py
```

### 2. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📜 License
Distributed under the MIT License.

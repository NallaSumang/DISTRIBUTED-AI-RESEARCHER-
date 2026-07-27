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
    A[Next.js Client] -->|HTTP POST| B[FastAPI Orchestrator]
    B -->|Push Job| C[(Upstash Redis Queue)]
    C -->|BRPOP| D[Python Worker Daemon]
    
    subgraph Swarm Intelligence
        D --> E[Architect Agent: Topic Breakdown]
        E --> F[Async Scout 1]
        E --> G[Async Scout 2]
        E --> H[Async Scout 3]
        F --> I[Synthesizer Agent]
        G --> I
        H --> I
    end
    
    I -->|Archive Report| J[(Supabase PostgreSQL)]
    I -->|Cache Result| C
    A -->|Poll Result| B
    B -->|Fetch| C
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

<div align="center">
  <h1>🧠 Distributed AI Researcher</h1>
  <p>An asynchronous Swarm Intelligence architecture designed to autonomously browse the web, synthesize data, and store structured research reports.</p>
</div>

---

## ⚙️ Core Architecture

This project is decoupled into a frontend UI and a Python background worker to support concurrent AI tasks without blocking the main event loop.

- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend Orchestrator:** FastAPI (Python).
- **Message Queue:** Upstash Redis handles incoming HTTP requests as a persistent job queue, preventing timeouts during extensive AI generation loads.
- **Background Daemon:** A persistent Python thread (`worker.py`) processes the Redis queue and initiates the AI swarm workflow.
- **Database:** Supabase (PostgreSQL) is utilized as a standard relational database to permanently archive and store structured research reports (CRUD).

## 🤖 The Swarm Intelligence (AI Agents)

This system deploys a multi-step workflow driven by LangGraph, leveraging async I/O to conduct deep research efficiently:

1. **The Architect Agent (1 AI):** 
   When a query is submitted, the initial reasoning model (LLaMA 3.3 via Groq) uses structured outputs to break the complex topic down into 3 hyper-specific research sub-queries.
   
2. **The Scout Agents (Parallel I/O):** 
   Using Python's `asyncio` and `duckduckgo-search`, the backend runs concurrent asynchronous searches over the network. These scouts fetch live search results simultaneously, avoiding I/O bottlenecks.
   
3. **The Synthesizer Agent (1 AI):** 
   Once the async scout agents return with their scraped data, the final Synthesizer AI (LLaMA 3.3 via Groq) reads all the context and synthesizes it into a single, cohesive Markdown document which is cached in Redis for the frontend to retrieve.

---

## 🚀 Deployment & Usage

### 1. Initialize the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*(In a separate terminal, start the queue worker):*
```bash
python worker.py
```

### 2. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```

<div align="center">
  <h1>🧠 Distributed AI Researcher</h1>
  <p>A multi-threaded Swarm Intelligence architecture designed to autonomously browse the web, synthesize data, and store structured research reports.</p>
  <p><i>Built from the ground up by Sumang</i></p>
</div>

---

## ⚙️ Core Architecture

This project is decoupled into a frontend UI and a Python background worker to support concurrent AI tasks without blocking the main event loop.

- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend Orchestrator:** FastAPI (Python).
- **Message Queue:** Upstash Redis handles incoming HTTP requests to prevent 504 timeouts during extensive AI generation loads.
- **Background Daemon:** A persistent Python thread (`worker.py`) processes the Redis queue asynchronously.
- **Database:** Supabase (PostgreSQL) is utilized to permanently store and index research reports in the cloud.

## 🤖 The Swarm Intelligence (AI Agents)

This system deploys between 5 and 7 independent AI processes simultaneously to conduct deep research. The computational workflow is split among three specialized agent types:

1. **The Architect Agent (1 AI):** 
   When a query is submitted, the initial reasoning model breaks the complex topic down into 3 to 5 hyper-specific research sub-queries.
   
2. **The Scout Agents (3 to 5 AIs):** 
   Using Python's `ThreadPoolExecutor`, the backend physically spins up 3 to 5 background threads. Each thread deploys a scout agent powered by the Tavily AI API. These agents browse the live internet, bypass captchas, and scrape raw data for their specific sub-query simultaneously.
   
3. **The Synthesizer Agent (1 AI):** 
   Once the scout agents return with their scraped data, the final Synthesizer AI (LLaMA 3.3) reads all 5 concurrent reports and synthesizes them into a single, cohesive Markdown document which is streamed back to the Next.js client.

---

## 🚀 Deployment & Usage

### 1. Initialize the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# (In a separate terminal, start the queue worker): 
python worker.py
```

### 2. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```

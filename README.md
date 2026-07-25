# DISTRIBUTED AI RESEARCHER

A multi-threaded AI architecture designed to autonomously browse the web, synthesize data, and store structured research reports. Built from the ground up by Sumang.

## Architecture

This project is decoupled into a frontend UI and a Python background worker to support concurrent AI tasks.
- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend:** FastAPI (Python).
- **Queue System:** Upstash Redis handles incoming requests to prevent timeouts during long AI operations.
- **Background Worker:** A daemon thread processes the Redis queue asynchronously.
- **Database:** Supabase (PostgreSQL) is used to permanently store research reports.

## The Swarm Intelligence (AI Agents)

This system deploys between 5 and 7 independent AI processes simultaneously to conduct research. The workflow is split among three specialized agent types:

1. **The "Architect" Agent (1 AI):** 
   When a query is submitted, the initial AI model breaks the complex topic down into 3 to 5 hyper-specific research sub-queries.
   
2. **The "Scout" Agents (3 to 5 AIs):** 
   Using Python's `ThreadPoolExecutor`, the backend physically spins up 3 to 5 background threads. Each thread deploys a scout agent powered by the Tavily API. These agents browse the live internet, bypass captchas, and scrape raw data for their specific sub-query simultaneously.
   
3. **The "Synthesizer" Agent (1 AI):** 
   Once the scout agents return with their scraped data, the final Synthesizer AI (LLaMA 3.3) reads all 5 reports concurrently and synthesizes them into a single, cohesive Markdown document.

## How to Run

**1. Backend**
```bash
cd backend
pip install -r requirements.txt
python main.py
# (In a separate terminal, start the queue worker): 
python worker.py
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

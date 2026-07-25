# DISTRIBUTED AI RESEARCHER

A multi-threaded AI architecture designed to autonomously browse the web, synthesize data, and store research reports. Built from the ground up by Sumang.

## Architecture

This project is decoupled into a frontend UI and a Python background worker to support concurrent AI tasks.

- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend:** FastAPI (Python).
- **Queue System:** Upstash Redis handles incoming requests to prevent timeouts during long AI operations.
- **Background Worker:** A background Python thread processes the Redis queue.
- **AI Agents:** Uses `ThreadPoolExecutor` to deploy concurrent search agents via the Tavily API, synthesized by LLaMA 3.3.
- **Database:** Supabase (PostgreSQL) is used to store research reports permanently.

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

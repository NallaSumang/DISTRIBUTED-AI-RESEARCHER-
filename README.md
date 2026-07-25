# 🧠 DISTRIBUTED AI RESEARCHER
### Sumang's Signature Edition

Welcome to **Distributed AI Researcher** — an elite, multi-threaded "Swarm Intelligence" architecture designed to autonomously research, synthesize, and immortalize complex topics.

---

## ⚡ Core Architecture
This project is built using a fundamentally decoupled architecture to achieve extreme speed and responsiveness:
- **Frontend:** Next.js 15 + TailwindCSS. Features a stunning, pure 3D animated Cyber-Grid that renders completely on the GPU via CSS Keyframes.
- **Backend Orchestrator:** FastAPI (Python) running on Port 7860.
- **Message Broker:** Upstash Redis. Instantly catches and queues incoming HTTP requests to prevent 504 Timeouts during 60-second AI generation times.
- **Background Worker:** A Python Daemon thread (`worker.py`) that endlessly processes the Redis queue.
- **The Swarm:** Uses `ThreadPoolExecutor` to deploy 5 concurrent AI web-browsing agents simultaneously.
- **Permanent Memory:** Supabase (PostgreSQL) is used to permanently store structured research reports in the cloud.

---

## 📚 Masterpiece Documentation
I have written an incredibly deep, file-by-file breakdown of exactly how this architecture works, why Node.js was rejected for the backend, and how the Swarm operates. 

You can find this complete technical guide locally in your repository at:
**`docs/DISTRIBUTED_AI_Masterpiece_Guide.md`**

*(Note: The Masterpiece Guide is configured in `.gitignore` and kept strictly local to your machine for your personal understanding.)*

---

## 🚀 How to Run

**1. Boot the Backend (Python)**
```bash
cd backend
pip install -r requirements.txt
python main.py
# (In a separate terminal): python worker.py
```

**2. Boot the Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```

---
*Skillfully Designed and Architected by Sumang.*

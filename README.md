**Distributed AI Researcher** is a high-performance, multi-agent engine designed for deep-dive information synthesis. Unlike traditional linear search tools, this system leverages a **swarming architecture** to decompose complex queries, perform parallel web research, and generate structured intelligence reports.

---

## 🚀 System Architecture

This project implements an **AI-Native** distributed workflow across specialized cloud layers to ensure low latency and high scalability:

*   **Frontend (Next.js & Vercel):** A cinematic, glassmorphic UI optimized for real-time status tracking and Markdown rendering.
*   **Orchestration Layer (FastAPI & Docker):** A high-throughput API gateway that manages the task lifecycle and secures the environment.
*   **Neural Swarm (LangGraph & Groq):** An agentic loop that utilizes **Llama 3.3 70B** to plan, execute, and refine research paths.
*   **Neural Memory (Supabase):** A persistent database for long-term storage and retrieval of research history.
*   **Task Queue (Upstash Redis):** An asynchronous bridge between the web interface and the background workers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **User Interface** | Next.js 14, Tailwind CSS, Framer Motion |
| **Logic & Agents** | LangGraph, LangChain, Python 3.11 |
| **Inference Engine** | Llama 3.3 70B (via Groq) |
| **Search Infrastructure** | DuckDuckGo Search API |
| **Infrastructure** | Docker, Hugging Face Spaces, Vercel |
| **Data Persistence** | Supabase (Postgres), Upstash (Redis) |

---

## ⚡ Key Features

*   **🕵️ Intelligent Planning:** The "Planner Agent" dynamically breaks down broad topics into targeted search queries.
*   **🌐 Real-Time Synthesis:** Python-based search tools retrieve and analyze live web data for up-to-the-minute accuracy.
*   **🧠 High-Fidelity Reasoning:** Powered by **Llama 3.3**, the industry standard for reasoning and versatile content generation.
*   **💾 Distributed Reliability:** A decoupled worker-client architecture ensures the UI remains responsive while the "Brain" processes tasks.

---

## ⚙️ Setup & Deployment

### Environment Variables

To initialize the neural swarm, configure these variables in your environment:

**Backend (Hugging Face Secrets)**
```bash
GROQ_API_KEY=your_groq_key
UPSTASH_REDIS_URI=your_rediss_url
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Frontend (.env.local)

Bash
NEXT_PUBLIC_API_BASE=your_hugging_face_url
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
Installation
Clone: git clone https://github.com/yourusername/distributed-ai-researcher

Dependencies: pip install -r requirements.txt (Backend) | npm install (Frontend)

Launch: python main.py (Backend) | npm run dev (Frontend)

[!IMPORTANT]
This project is part of a portfolio focused on AI-Native Product Engineering, demonstrating expertise in agentic workflows, distributed systems, and real-time LLM integration.

# Distributed AI Researcher

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge)](https://distributed-ai-researcher.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_FastAPI_|_LangGraph-blue?style=for-the-badge)](#%EF%B8%8F-tech-stack)

**Distributed AI Researcher** is a high-performance, multi-agent engine designed for deep-dive information synthesis. Unlike traditional linear search tools, this system leverages a distributed agentic architecture to decompose complex queries, execute parallel web research, and generate structured, context-rich intelligence reports.

**[Launch Live Application](https://distributed-ai-researcher.vercel.app)**

---

## 🚀 System Architecture

This project implements a decoupled, event-driven workflow across specialized cloud layers to ensure high availability and robust state management:

* **Client Interface (Next.js & Vercel):** A highly responsive, server-side rendered UI optimized for real-time WebSocket status tracking and dynamic Markdown streaming.
* **Orchestration Gateway (FastAPI & Docker):** A high-throughput REST API that manages the task lifecycle, handles rate limiting, and secures the inference environment.
* **Agentic Engine (LangGraph & Groq):** An iterative reasoning loop utilizing **Llama 3.3 70B** to dynamically plan, execute, and refine multi-step research paths.
* **State Management (Supabase Postgres):** A persistent relational database handling long-term storage and retrieval of research artifacts and conversation history.
* **Message Broker (Upstash Redis):** An asynchronous queue decoupling the web interface from background worker processes to prevent blocking operations.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, Tailwind CSS, Framer Motion |
| **Backend Orchestration** | FastAPI, Python 3.11, Docker |
| **AI / Agent Framework** | LangChain, LangGraph |
| **Inference Engine** | Llama 3.3 70B (via Groq) |
| **Search Infrastructure** | DuckDuckGo Search API |
| **Data Persistence** | Supabase (PostgreSQL), Upstash (Redis) |
| **Deployment** | Vercel (UI), Hugging Face Spaces (Backend) |

---

## ⚡ Core Capabilities

* **Dynamic Query Decomposition:** The Planner Agent breaks broad, ambiguous topics into targeted, executable search directives.
* **Parallel Data Ingestion:** Custom Python tools retrieve, scrape, and filter live web data to ensure high-fidelity, up-to-the-minute accuracy.
* **Advanced Reasoning:** Powered by Llama 3.3, the system evaluates conflicting data sources and synthesizes cohesive, hallucination-resistant reports.
* **Fault-Tolerant Execution:** The decoupled worker-client architecture ensures UI responsiveness even during heavy, long-running agent execution tasks.

---

## ⚙️ Local Setup & Deployment

### Environment Variables

Configure the following variables in your respective environments to initialize the backend queue and frontend clients.

**Backend (`.env` or Hugging Face Secrets)**
```env
GROQ_API_KEY=your_groq_key
UPSTASH_REDIS_URI=your_redis_url
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

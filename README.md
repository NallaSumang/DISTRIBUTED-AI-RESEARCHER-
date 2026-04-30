

This project implements an **AI-Native** distributed workflow across specialized cloud layers to ensure low latency and high scalability:

*   **Frontend (Next.js & Vercel):** A cinematic, glassmorphic UI optimized for real-time status tracking and Markdown rendering.
*   **Orchestration Layer (FastAPI & Docker):** A high-throughput API gateway that manages the task lifecycle and secures the environment.
*   **Neural Swarm (LangGraph & Groq):** An agentic loop that utilizes **Llama 3.3 70B** to plan, execute, and refine research paths.
*   **Neural Memory (Supabase):** A persistent database for long-term storage and retrieval of research history.
*   **Task Queue (Upstash Redis):** An asynchronous bridge between the web interface and the background workers.

---

<div align="center">
  <img src="https://img.shields.io/badge/DISTRIBUTED-AI-EF4444?style=for-the-badge&logo=openai&logoColor=white" alt="DISTRIBUTED AI" />
  <h1>DISTRIBUTED AI RESEARCHER</h1>
  <p><strong>Sumang's Signature Edition</strong></p>
</div>

<br />

## 🌟 Overview
The **Distributed AI Researcher** is an advanced Swarm Intelligence application. It goes beyond the capabilities of a single language model by utilizing a multi-agent orchestrated backend. When given a complex research topic, an "Architect" agent breaks the topic down into highly focused sub-queries, and spawns multiple "Worker" agents to scour the internet simultaneously. Their findings are then synthesized into one ultimate, comprehensive master report.

## ✨ Features
- 🐝 **Swarm Intelligence:** Uses advanced asynchronous multi-threading to deploy multiple LLaMA 3.3 agents concurrently.
- 🌐 **Real-time Web Browsing:** Integrates with the Tavily API to fetch live, up-to-the-second information from the internet.
- 🐉 **Dragonic Cyber-Grid UI:** A completely custom, 3D animated user interface with drifting embers and a raw, high-tech aesthetic.
- 🧠 **Neural Memory:** Automatically syncs your past research to a Supabase PostgreSQL database, accessible anywhere.

## 🏗️ Architecture

### 1. The Backend (Python Swarm Engine)
The core logic resides in `backend/ai_swarm.py` and `worker.py`.
- **Architect (LLaMA 3.3):** Analyzes the prompt and generates 3-5 distinct sub-topics.
- **Workers (Tavily + LLaMA 3.3):** Each sub-topic is handed to a thread pool worker. The worker browses the internet, reads the top results, and writes a detailed sub-report.
- **Synthesizer:** The Architect merges all sub-reports into a massive Markdown research paper.

### 2. The Frontend (Next.js 15 / Tailwind)
- A highly polished, "HUD" style interface.
- 3D CSS perspective transforms create an infinite scrolling cyber-grid.
- Mobile-responsive Neural Memory sidebar.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+

### Setup
1. **Clone the repository.**
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   TOGETHER_API_KEY=your_llama_key_here
   TAVILY_API_KEY=your_tavily_key_here
   ```
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Run the Swarm
Start the Next.js frontend:
```bash
cd frontend
npm run dev
```
Start the Python backend:
```bash
cd backend
python main.py
```

---
*Architected and Engineered for Sumang.*

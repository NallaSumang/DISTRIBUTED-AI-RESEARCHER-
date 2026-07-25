# DISTRIBUTED AI RESEARCHER
### Sumang's Signature Edition - Masterpiece Documentation

## 1. Project Genesis: Why Python & Next.js?
The Distributed AI Researcher relies on "Swarm Intelligence"—spawning multiple AI agents simultaneously to research a topic. 

**Why did we start with Python for the Backend?**
Handling multiple asynchronous AI agents in JavaScript is a nightmare of nested promises and memory leaks. Python provides raw `ThreadPoolExecutor` modules, allowing us to spin up actual parallel threads. Each thread can independently run a Tavily web search and a LLaMA 3.3 analysis without blocking the main server.

By splitting the app, we let Python do what it does best (Heavy Compute & Threading) and let Next.js do what it does best (Beautiful, Animated UIs).

---

## 2. File-by-File Explanation

### 📂 `backend/main.py` (The Orchestrator)
This is the FastAPI entry point. 
- It listens on port `7860`.
- When the frontend sends a research topic, `main.py` generates a unique `job_id`, pushes the job into an Upstash Redis queue, and immediately tells the frontend "I received the job, here is the ID." This prevents HTTP timeouts.

### 📂 `backend/worker.py` (The Workhorse)
This is a background process that runs endlessly.
- **The Fix:** We ensured `supabase`, `redis`, and `python-dotenv` were properly listed in `requirements.txt`. Without these, this file would crash immediately on boot.
- **The Queue:** It watches the Redis queue. The second `main.py` adds a job, `worker.py` snatches it.
- **Execution & Memory:** It hands the job to `ai_swarm.py`. Once the final report is generated, it saves it to Redis (so the frontend can quickly fetch it) AND it saves it permanently to Supabase PostgreSQL so your research history is immortalized in the cloud.

### 📂 `backend/ai_swarm.py` (The Architect)
This is where the magic happens.
- It takes the user's topic and asks LLaMA 3.3 to break it into 3-5 sub-queries.
- It uses Python's `concurrent.futures` to execute Tavily API searches for all sub-queries simultaneously.
- Finally, it gathers all the distinct reports and synthesizes them into one massive Markdown document.

### 📂 `frontend/app/page.tsx` (The Dragonic Cyber-Grid UI)
This is the visual layer.
- **The Bug Fix:** We originally painted a solid `bg-[#050505]` color over the main container, which accidentally hid the 3D grid! We removed this wall, making it `bg-transparent`.
- **The 3D Engine:** Using pure CSS (`transform: rotateX(60deg) translateZ(-200px)`), we created a 3D perspective floor. We animated a linear-gradient to make it look like an infinite grid scrolling towards the user.
- **The Polling Mechanism:** Because research takes 30-40 seconds, the frontend uses `setInterval` to "poll" the backend every 2 seconds, asking "Is job #123 done yet?". Once it's done, it stops polling and renders the Markdown!

### 📂 Configuration Files (`package.json`, `tsconfig.json`, etc.)
These files must remain in the root directory. Next.js uses them to understand how to build the React application, process the Tailwind CSS, and deploy to Vercel. Moving them into a `docs` or `backend` folder would completely sever Vercel's ability to host the site.

---

## 3. Conclusion
The Distributed AI Researcher represents elite engineering. It utilizes Redis for queue management, Supabase for persistent cloud storage, Multi-threading for concurrent AI execution, and 3D CSS rendering for an unforgettable user experience.

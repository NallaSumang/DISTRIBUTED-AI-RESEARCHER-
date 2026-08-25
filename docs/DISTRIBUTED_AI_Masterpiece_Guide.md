# Distributed AI Researcher — Technical Guidebook

> **Internal reference document — Sumang's Signature Edition**
> Last updated: August 2026
> Status: Production-deployed (Vercel + HuggingFace Spaces)

---

## Table of Contents

1. [System Philosophy](#1-system-philosophy)
2. [Architecture Deep-Dive](#2-architecture-deep-dive)
3. [Data Flow — Step by Step](#3-data-flow--step-by-step)
4. [Frontend Internals](#4-frontend-internals)
5. [Backend Internals](#5-backend-internals)
6. [AI Swarm Pipeline](#6-ai-swarm-pipeline)
7. [Security Model](#7-security-model)
8. [Deployment Infrastructure](#8-deployment-infrastructure)
9. [UI Design System](#9-ui-design-system)
10. [Known Behaviours & Quirks](#10-known-behaviours--quirks)
11. [Environment Variable Reference](#11-environment-variable-reference)
12. [Future Improvement Areas](#12-future-improvement-areas)

---

## 1. System Philosophy

The core problem this system solves: **LLM inference is slow. HTTP has timeouts. Blocking a web request for 30–120 seconds of LLM work causes 504 Gateway Timeouts.**

The solution is a **fire-and-forget job queue pattern**:

```
Client → POST /research → FastAPI returns job_id instantly (< 100ms)
                       → Worker picks up job asynchronously
                       → Client polls GET /job/{id} every 2 seconds
                       → When status = "completed", render report
```

This means:
- The HTTP request never blocks on LLM inference
- The worker can take as long as it needs (no timeout pressure)
- The frontend stays fully responsive during processing
- If the worker crashes mid-job, the job_id remains in Redis and can be re-queued

---

## 2. Architecture Deep-Dive

### Layer 1: Presentation (Vercel / Next.js 16)

**File**: `frontend/app/page.tsx`

The frontend is a single-page application using Next.js App Router. All state is local React state — no external state manager (Redux, Zustand) needed given the simplicity of the state graph:

```
query (string)
loading (boolean)
jobId (string | null)
report (string)
history (ResearchItem[])
sidebarOpen (boolean)
errorMsg (string | null)
```

The polling loop lives in a `useEffect` that watches `[jobId, loading]`. When `jobId` is set and `loading` is true, it `setInterval`s at 2000ms against `/api/proxy?jobId=...`. On `completed`, it sets the report and clears the interval. On `failed`, it sets an error report.

**Critical: `SidebarContent` is defined outside the `Home` component** — it is memoised with `React.memo`. This prevents it from being re-created on every render cycle, which was the original bug (defined as `const SidebarContent = () =>` inside `Home`, recreated every keystroke).

### Layer 2: BFF Proxy (Next.js API Route)

**File**: `frontend/app/api/proxy/route.ts`

The proxy exists for one reason: **the backend requires an `x-api-key` header**. This key must not be exposed to the browser. By routing through a Next.js server-side API route, the key lives only in the server environment (`process.env.INTERNAL_API_KEY`) and is injected into the outbound request at the edge.

- `POST /api/proxy` → forwards to `${API_BASE}/research`
- `GET /api/proxy?jobId=xxx` → forwards to `${API_BASE}/job/xxx`

### Layer 3: FastAPI Orchestrator (HuggingFace / Docker)

**File**: `backend/main.py`

The FastAPI application runs on port 7860 (the HuggingFace Spaces convention). It:
1. Validates the `x-api-key` header via a `Security` dependency
2. On `POST /research`: generates a UUID job_id, pushes `{job_id, query}` to Redis `research_jobs` list via `LPUSH`, returns `{job_id}`
3. On `GET /job/{id}`: fetches `job:{id}` from Redis, returns `{status, data}`

The FastAPI process itself does **zero AI work**. It is purely an authenticated message broker interface.

### Layer 4: Worker Daemon (HuggingFace / Docker)

**File**: `backend/worker.py`

The worker runs as a separate process in the same Docker container (`python worker.py &` in the Dockerfile CMD). It runs an infinite loop:

```python
while True:
    job = redis.brpop("research_jobs", timeout=30)
    if job:
        run_swarm_pipeline(job_data)
```

`brpop` is a **blocking pop** — the process sleeps at the OS level (no CPU burn) until a job arrives. On job receipt, it calls `ai_swarm.py`, then writes the result to Redis and Supabase.

### Layer 5: LangGraph Swarm (`backend/ai_swarm.py`)

Three agents in a directed acyclic graph. See [Section 6](#6-ai-swarm-pipeline) for full breakdown.

---

## 3. Data Flow — Step by Step

```
1.  User types query → presses Enter or "Execute"
2.  handleSearch() sets loading=true, clears report
3.  POST /api/proxy {query}
4.  Next.js proxy injects x-api-key → forwards to HuggingFace FastAPI
5.  FastAPI validates key → LPUSH {job_id, query} to Redis
6.  FastAPI returns {job_id: "uuid-..."} in < 100ms
7.  Frontend stores jobId in state → starts polling setInterval(2000ms)
8.  Python worker.py wakes from BRPOP → receives job
9.  worker.py calls run_research(query)
10. ai_swarm.py: Architect Agent → Groq LLM → 3-5 sub-queries (JSON)
11. ai_swarm.py: Scout Agents → asyncio.gather → DuckDuckGo → raw results
12. ai_swarm.py: Synthesizer Agent → Groq LLM (32k context) → Markdown report
13. worker.py: SET job:{id} = {status:"completed", data: report} in Redis
14. worker.py: INSERT into Supabase research_history table
15. Frontend poll hits status="completed"
16. setReport(stripThinking(data)) — strips any <think>...</think> blocks
17. setLoading(false), setJobId(null), clearInterval
18. fetchHistory() refreshes sidebar
19. Report renders via ReactMarkdown + remarkGfm inside .report-body
```

---

## 4. Frontend Internals

### Component Tree

```
Home (page.tsx)
├── ErrorToast          — Animated inline error (replaces browser alert)
├── AnimatePresence     — Mobile sidebar overlay
│   └── motion.aside
│       └── SidebarContent (memo)
│           └── motion.button[] — History items
├── aside               — Desktop sidebar (xl+)
│   └── SidebarContent (memo)
└── main
    ├── header
    │   ├── Menu button (mobile)
    │   ├── Brain logo
    │   └── Status badges (Live Search, Llama 3.3)
    ├── SearchBox
    │   ├── Search input
    │   └── Execute button
    └── AnimatePresence (result area)
        ├── SwarmLoader    — 3-ring animated loader (when loading)
        ├── ReportCard     — (when report exists)
        │   ├── Analysis Summary header
        │   ├── article.report-body
        │   │   └── ReactMarkdown [remarkGfm]
        │   └── Scroll-to-top button
        └── EmptyState     — Sparkles icon (default)
```

### Key Components

#### `SwarmLoader`
Three concentric rings rotating at different speeds and directions, with a pulsing core. Purely CSS `@keyframes` defined in `globals.css`:
- Outer ring: `spin-slow` 3s clockwise
- Mid ring: `spin-reverse` 2s counter-clockwise
- Inner ring: `spin-slow` 1.2s clockwise
- Core: Tailwind `animate-pulse`

#### `ErrorToast`
Framer Motion animated div, fixed to top-center of viewport. Slides down from `y: -12` on mount, slides back up on dismiss. Dismissed by clicking the `X` button or resolved by a successful retry. **Never auto-dismisses** — user must act.

#### `SidebarContent`
Memoised with `React.memo`. Accepts `history`, `onSelect`, `onClose` as props. Defined at module level (outside `Home`), so React identity is stable across renders. Each history item is a `motion.button` with `initial={{ opacity: 0, x: -8 }}` entrance animation.

### Typography System (`.report-body`)

The report output uses a hand-tuned CSS class defined in `globals.css`. **No Tailwind prose modifier classes are used** — they created specificity conflicts. The hierarchy:

| Element | Color | Notes |
|---|---|---|
| Body text | `#b0bec5` | Warm slate, readable |
| `h1` | `#f5f5f5` | Near-white, bottom border |
| `h2` | `#e0e0e0` | Red gradient `::before` accent bar |
| `h3` | `#c8c8c8` | Mid-level |
| `h4/h5` | `#9e9e9e` | Uppercase label treatment |
| `strong` | `#e8e8e8` | Elevated from body |
| `em` | `#94a3b8` | Cool slate, editorial |
| Links | `#f87171` | Red-400, ghost underline |
| Inline code | `#fecdd3` | Rose-200 on dark-red bg |
| Code blocks | `#cdd6f4` | Catppuccin lavender on near-black |
| Blockquotes | `#78909c` | Red border-left + red wash bg |

### `stripThinking(text)`

Some Groq models (particularly reasoning variants like Qwen3) emit `<think>...</think>` blocks containing chain-of-thought reasoning. These are stripped before rendering:

```ts
function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
```

Applied both on live report arrival and when loading from history.

---

## 5. Backend Internals

### `main.py` — FastAPI Gateway

Key routes:

```python
POST /research
  body: {query: str}
  → validates x-api-key
  → job_id = str(uuid4())
  → redis.lpush("research_jobs", json.dumps({job_id, query}))
  → redis.setex(f"job:{job_id}", 3600, json.dumps({status:"queued"}))
  → return {job_id}

GET /job/{job_id}
  → validates x-api-key
  → data = redis.get(f"job:{job_id}")
  → return {status, data} or {status: "not_found"}
```

### `worker.py` — Daemon

Runs as background process in Docker. Uses `redis.brpop` with 30s timeout (prevents permanent blocking if Redis disconnects). On job receipt:

1. Updates job status in Redis: `processing`
2. Calls `run_research(query)` from `ai_swarm.py`
3. On success: writes `completed` + report to Redis; inserts to Supabase
4. On exception: writes `failed` + error message to Redis

### `ai_swarm.py` — LangGraph Pipeline

```python
# Simplified state graph
graph = StateGraph(ResearchState)
graph.add_node("architect", architect_node)
graph.add_node("scouts", scouts_node)
graph.add_node("synthesizer", synthesizer_node)
graph.add_edge("architect", "scouts")
graph.add_edge("scouts", "synthesizer")
graph.set_entry_point("architect")
graph.set_finish_point("synthesizer")
```

- **Architect**: Groq call → robust Regex JSON extraction → list of sub-queries
- **Scouts**: `asyncio.gather` over DuckDuckGo (sync wrapper) or Tavily searches → parallel results
- **Synthesizer**: All scout results concatenated into context → Groq call → full Markdown report (max_tokens: 4096, context capped at ~12k chars to respect free tier TPM)

---

## 6. AI Swarm Pipeline

### Agent 1: Architect

**Input**: User's raw query string
**Output**: Pydantic model with 5 sub-queries

The Architect uses a structured output schema enforced by Pydantic. The Groq LLM is instructed to act as a Senior Research Architect and return JSON only. This prevents free-form rambling and ensures every sub-query is actionable for the Scout agents.

**Robust Parsing**: Reasoning models often inject `<think>` blocks or wrap JSON in Markdown code blocks (e.g., ````json`). Instead of brittle string slicing, the Architect uses a robust Regex extractor (`re.search(r'\[.*\]', content, re.DOTALL)`) to guarantee the JSON array is always successfully isolated and parsed.

**Why decompose?** A single broad query like "quantum computing" produces shallow results. Breaking it into 5 targeted sub-queries produces deeper, more specific content.

### Agent 2: Scouts (Parallel)

**Input**: List of sub-queries from Architect
**Output**: Dict mapping sub-query → raw search results

Uses `asyncio.gather` to fire all DuckDuckGo searches concurrently. Each search retrieves the top 6 results (increased to provide a larger context block). Results are title + snippet + URL.

**No blocking I/O**: The entire scout phase completes in approximately the time of a single search request (not N × time), because all requests are in-flight simultaneously.

### Agent 3: Synthesizer

**Input**: All scout results concatenated (context up to 32k tokens)
**Output**: Full Markdown report

The Synthesizer receives a structured prompt containing all scout findings (up to 30 results) and is instructed to produce a highly detailed, multi-page manifesto:
- Executive Overview
- Deep-Dive Architectural & Contextual Analysis
- Core Metrics, Economics, & Key Facts
- Prominent Real-World Case Studies
- Visionary & Optimistic Conclusion

`max_tokens=4096` ensures reports are detailed while strictly remaining under the 8,000 Tokens Per Minute (TPM) limit of the Groq Free Tier. The context is truncated to 12,000 characters (~3,000 tokens) to guarantee the combined request never triggers a 413 Rate Limit Error.

### Agent 4 (Virtual): Multi-Model Fallback Chain

To achieve true "indestructibility", the pipeline does not rely on a single LLM. Both the Architect and Synthesizer use LangChain's `.with_fallbacks()` protocol. If the primary model (`qwen/qwen3.6-27b`) fails due to a `413 Rate Limit`, `404 Not Found` (model deprecated/unavailable on a specific tier), or `503 Server Down`, the system instantly and silently cascades to:

1. `llama3-8b-8192` (Lightweight fallback)
2. `mixtral-8x7b-32768` (Heavy reasoning fallback)
3. `llama-3.3-70b-versatile` (Premium tier fallback)
4. `gemma2-9b-it` (Final safety net)

This ensures the 3-attempt crash loop is virtually eliminated in production.

---

## 7. Security Model

### What is protected and how

| Secret | Where it lives | How used |
|---|---|---|
| `GROQ_API_KEY` | HuggingFace Spaces env var | Backend only — never sent to client |
| `UPSTASH_REDIS_URI` | HuggingFace Spaces env var | Backend only |
| `SUPABASE_KEY` (service role) | HuggingFace Spaces env var | Backend only — full DB access |
| `API_SECRET_KEY` | Both `.env` files | Backend validates; frontend proxy injects |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env var | Client-side — safe by design (anon key) |

### BFF Proxy pattern

The browser **never** calls the FastAPI backend directly. All calls go to `/api/proxy` which is a Next.js server-side route. This route:
1. Reads `INTERNAL_API_KEY` from server environment (invisible to browser)
2. Injects it as `x-api-key` header
3. Forwards the request to `API_BASE` (the HuggingFace Spaces URL)

If someone tries to call the FastAPI endpoint directly without the key, they receive `401 Unauthorized` immediately.

---

## 8. Deployment Infrastructure

### Frontend — Vercel

- Root directory configured to `frontend/` in Vercel dashboard
- Auto-deploys on every push to `main`
- Environment variables set in Vercel project settings (never in code)
- Build command: `npm run build` (Next.js production build)

### Backend — HuggingFace Spaces

- Space type: Docker
- Synced automatically via `.github/workflows/sync-to-hf.yml` on push to `main`
- The Dockerfile starts both processes: `python worker.py & uvicorn main:app --host 0.0.0.0 --port 7860`
- **Cold-start behaviour**: Free-tier Spaces sleep after ~15 minutes of inactivity. Wake time: 30–60 seconds. The frontend handles this gracefully with the `ErrorToast` component.

### GitHub Actions Sync Workflow

On every push to `main`, the workflow:
1. Checks out the repository
2. Pushes the `backend/` directory contents to the HuggingFace Space repository via git
3. HuggingFace rebuilds the Docker image and restarts the Space

---

## 9. UI Design System

### Colour Palette

| Role | Value | Usage |
|---|---|---|
| Background | `#030000` | Page root |
| Surface | `rgba(255,255,255,0.01)` | Cards, sidebars |
| Border | `rgba(255,255,255,0.03–0.06)` | Hairline separators |
| Brand red | `#dc2626` | Accents, h2 bars |
| Text primary | `#ffffff` | H1 headings (with gradient), Bold text |
| Text secondary | `#f1f5f9` | Body copy |
| Text muted | `#cbd5e1` | Uppercase labels, italics |
| Link | `#fca5a5` | In-report links |
| Error | `#fca5a5` | Toast, error states |

### Animation Keyframes (globals.css)

| Name | Duration | Used by |
|---|---|---|
| `grid-pan` | 4s linear infinite | Background grid |
| `scan-line` | 6s ease-in-out infinite | Red scan beam |
| `float-ember` | 4–7s ease-in-out infinite | Particle embers |
| `spin-slow` | 1.2s / 3s linear infinite | SwarmLoader rings |
| `spin-reverse` | 2s linear infinite | SwarmLoader mid-ring |
| `pulse-ring` | — | Available for future use |
| `fade-up` | — | Available for future use |

### Responsive Breakpoints

- `< xl` (1280px): Mobile layout — sidebar hidden, hamburger menu shown
- `xl+`: Desktop layout — sidebar pinned left (w-72), main content offset (`ml-72`)

---

## 10. Known Behaviours & Quirks

### HuggingFace Cold-Start
The free-tier Space sleeps after inactivity. First request post-sleep takes 30–60s and will hit the `ErrorToast`. User should wait and retry. **Not a bug — expected behaviour of the hosting tier.**

### Reasoning Model Think-Tags
If the backend is switched to a reasoning model (e.g., Qwen3, DeepSeek-R1), the output contains `<think>...</think>` blocks with internal chain-of-thought. These are stripped by `stripThinking()` before rendering. Applied both on live results and history recall.

### Redis TTL
Job results in Redis expire after 3600 seconds (1 hour). If a user bookmarks a `job_id` URL and returns after an hour, the data is gone from Redis but still in Supabase history.

### Groq Free Tier 8000 TPM Limits
Groq's Free Tier strictly caps requests at 8,000 Tokens Per Minute (TPM). Because Groq reserves the *entirety* of `max_tokens` against this limit immediately, setting `max_tokens=8192` (as was originally done) guarantees an instant `413 Rate Limit` crash. The system is now explicitly tuned to `max_tokens=4096` and a truncated 12,000-character context window to safely execute within free tier constraints.

### Supabase Anon Key in Browser
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is visible in the browser bundle — this is **intentional and safe**. The Supabase anon key is a public identifier, not a secret. Access control is enforced by Row Level Security (RLS) policies on the Supabase side.

### `remark-gfm` Required for Tables
The AI synthesizer often produces Markdown tables in reports. Without `remark-gfm`, `react-markdown` renders them as raw text. `remark-gfm` also enables strikethrough (`~~text~~`) and task lists (`- [x]`).

---

## 11. Environment Variable Reference

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq cloud API key (gsk_...) |
| `UPSTASH_REDIS_URI` | ✅ | Upstash Redis connection URL (rediss://...) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_KEY` | ✅ | Supabase service role key (full access) |
| `API_SECRET_KEY` | ✅ | Shared secret for x-api-key validation |

### `frontend/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (public — safe in browser) |
| `API_BASE` | ✅ | Backend URL (HuggingFace Space URL in prod, `http://localhost:7860` in dev) |
| `INTERNAL_API_KEY` | ✅ | Must match backend `API_SECRET_KEY` |

---

## 12. Future Improvement Areas

### High Priority
- [ ] **Auto-dismiss toast**: Add a 10s auto-dismiss timer to `ErrorToast` with a countdown indicator
- [ ] **Report export**: Add PDF / copy-to-clipboard button on the report card
- [ ] **Streaming output**: Switch from polling to Server-Sent Events for real-time token streaming
- [ ] **Query validation**: Client-side check before submission (min length, offensive content filter)

### Medium Priority
- [ ] **Search engine toggle**: Let user choose DuckDuckGo vs Tavily in the UI
- [ ] **Report re-run**: Button to re-research the same query (force fresh results)
- [ ] **Word count indicator**: Show estimated reading time on the report header
- [ ] **Dark/light mode toggle**: Currently hard-coded to dark

### Low Priority
- [ ] **Supabase RLS**: Set up proper Row Level Security policies (currently open to anon reads)
- [ ] **Rate limiting**: Add FastAPI rate limiting (e.g., slowapi) to prevent abuse
- [ ] **Caching layer**: Cache identical queries in Redis to skip LLM inference on repeat topics
- [ ] **Multi-model support**: Add model selector (Llama 3.3, Mixtral, Gemma) in the UI

---

*Document maintained by Sumang — last updated August 2026.*

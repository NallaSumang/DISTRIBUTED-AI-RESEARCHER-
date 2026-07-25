from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from collections import defaultdict
import uuid
import json
import os
import time
from dotenv import load_dotenv, find_dotenv
import redis

load_dotenv(find_dotenv(), override=True)

app = FastAPI(title="Distributed AI Research Agent API")

# --- CORS: Only allow your actual frontend domain ---
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://distributed-ai-researcher.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# --- RATE LIMITING: 5 research requests per minute per IP ---
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 5
RATE_WINDOW = 60

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit the research endpoint
    if request.url.path == "/api/research" and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        _rate_limit_store[client_ip] = [t for t in _rate_limit_store[client_ip] if now - t < RATE_WINDOW]
        if len(_rate_limit_store[client_ip]) >= RATE_LIMIT:
            raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
        _rate_limit_store[client_ip].append(now)
    return await call_next(request)

# --- REDIS CONNECTION ---
redis_uri = os.getenv('UPSTASH_REDIS_URI')
if not redis_uri:
    raise RuntimeError("UPSTASH_REDIS_URI environment variable not set")
redis_client = redis.from_url(redis_uri)

# --- REQUEST MODEL WITH VALIDATION ---
class ResearchRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Query cannot be empty.")
        if len(v) > 2000:
            raise ValueError("Query too long. Maximum 2000 characters.")
        return v

@app.get("/")
async def root():
    return {"status": "Online", "service": "Distributed AI Research Agent"}

@app.post("/api/research")
async def start_research(request: ResearchRequest):
    job_id = str(uuid.uuid4())
    job_data = {"job_id": job_id, "query": request.query}

    # Send to queue
    redis_client.lpush("research_jobs", json.dumps(job_data))

    return {"job_id": job_id, "status": "queued"}

@app.get("/api/research/{job_id}")
async def get_result(job_id: str):
    # Check if the worker saved a result for this ID
    result = redis_client.get(f"result:{job_id}")

    if result:
        result_data = result.decode('utf-8')
        # Check if it's a failure marker
        if result_data.startswith("__FAILED__:"):
            return {
                "job_id": job_id,
                "status": "failed",
                "data": result_data.replace("__FAILED__:", "")
            }
        return {
            "job_id": job_id,
            "status": "completed",
            "data": result_data
        }

    return {"job_id": job_id, "status": "processing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
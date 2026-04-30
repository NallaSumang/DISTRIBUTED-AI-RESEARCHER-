from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
import os
from dotenv import load_dotenv, find_dotenv
import redis

load_dotenv(find_dotenv(), override=True)

app = FastAPI(title="AI Research Agent API")

# CRITICAL: Allow your Frontend to talk to your Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.from_url(os.getenv('UPSTASH_REDIS_URI'))

@app.get("/")
async def root():
    return {"status": "Online"}

@app.post("/api/research")
async def start_research(query: str):
    job_id = str(uuid.uuid4())
    job_data = {"job_id": job_id, "query": query}
    
    # Send to queue
    redis_client.lpush("research_jobs", json.dumps(job_data))
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/research/{job_id}")
async def get_result(job_id: str):
    # Check if the worker saved a result for this ID
    result = redis_client.get(f"result:{job_id}")
    
    if result:
        return {
            "job_id": job_id,
            "status": "completed",
            "data": result.decode('utf-8')
        }
    
    return {"job_id": job_id, "status": "processing"}
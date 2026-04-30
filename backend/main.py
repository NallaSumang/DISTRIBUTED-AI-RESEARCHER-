import os
import threading
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
import uuid

app = FastAPI(title="Swarm Intelligence API")

# Allow Vercel to talk to Hugging Face
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Upstash Redis
redis_client = redis.from_url(os.getenv("UPSTASH_REDIS_URI"))

class ResearchRequest(BaseModel):
    query: str

@app.post("/api/research")
async def start_research(request: ResearchRequest):
    job_id = str(uuid.uuid4())
    # Add task to the queue
    redis_client.lpush("research_queue", f"{job_id}:{request.query}")
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/research/{job_id}")
async def get_status(job_id: str):
    # Check if report is ready in Redis
    report = redis_client.get(f"result:{job_id}")
    if report:
        return {"status": "completed", "data": report.decode("utf-8")}
    return {"status": "processing"}

# --- THE "TWO-IN-ONE" MAGIC ---
def start_worker():
    print("🚀 Background Worker Thread Starting...")
    os.system("python worker.py")

if __name__ == "__main__":
    # Start worker.py in a background thread
    threading.Thread(target=start_worker, daemon=True).start()
    # Run FastAPI on the port Hugging Face expects (7860)
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)

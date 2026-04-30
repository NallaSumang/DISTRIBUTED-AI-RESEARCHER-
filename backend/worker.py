import os
import json
from dotenv import load_dotenv, find_dotenv
import redis
from supabase import create_client, Client
from ai_swarm import execute_research

load_dotenv(find_dotenv(), override=True)

# 1. Initialize Redis
redis_client = redis.from_url(os.getenv('UPSTASH_REDIS_URI'))

# 2. Initialize Supabase (Long-term Memory)
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("🚀 Worker Engine Active. Saving all research to Supabase...")

try:
    while True:
        queue_name, raw_data = redis_client.brpop("research_jobs", timeout=0)
        job_data = json.loads(raw_data.decode('utf-8'))
        job_id = job_data['job_id']
        query = job_data['query']
        
        print(f"\n[WORKING] Processing: {query}")
        
        # Run the AI Swarm
        final_report = execute_research(query)
        
        # SAVE to Redis (Short-term cache for the frontend to poll)
        redis_client.setex(f"result:{job_id}", 3600, final_report)
        
        # SAVE to Supabase (Permanent History)
        try:
            supabase.table("research_history").insert({
                "query": query, 
                "report": final_report
            }).execute()
            print(f"[SUCCESS] Report permanently archived in Supabase.")
        except Exception as e:
            print(f"[ERROR] Database save failed: {e}")

except KeyboardInterrupt:
    print("Shutting down...")
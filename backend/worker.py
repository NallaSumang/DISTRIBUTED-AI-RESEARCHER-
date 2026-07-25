import os
import json
from dotenv import load_dotenv, find_dotenv
import redis
from supabase import create_client, Client
from ai_swarm import execute_research

load_dotenv(find_dotenv(), override=True)

# 1. Initialize Redis
redis_uri = os.getenv('UPSTASH_REDIS_URI')
if not redis_uri:
    raise RuntimeError("UPSTASH_REDIS_URI environment variable not set")
redis_client = redis.from_url(redis_uri)

# 2. Initialize Supabase (Long-term Memory)
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
if not url or not key:
    raise RuntimeError("SUPABASE_URL or SUPABASE_KEY environment variable not set")
supabase: Client = create_client(url, key)

print("Worker Engine Active. Saving all research to Supabase...")

try:
    while True:
        queue_name, raw_data = redis_client.brpop("research_jobs", timeout=0)
        job_data = json.loads(raw_data.decode('utf-8'))
        job_id = job_data['job_id']
        query = job_data['query']
        
        print(f"\n[WORKING] Processing: {query}")
        
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
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
                except Exception as db_e:
                    print(f"[ERROR] Database save failed: {db_e}")
                
                break # Success, exit retry loop
            except Exception as e:
                print(f"[ERROR] Research failed for {job_id} (Attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    error_report = f"### Error\n\nAn error occurred while researching this topic after {max_retries} attempts."
                    # Prefix with __FAILED__: so main.py knows it failed
                    redis_client.setex(f"result:{job_id}", 3600, f"__FAILED__:{error_report}")
                else:
                    import time
                    time.sleep(2 ** attempt) # Exponential backoff

except KeyboardInterrupt:
    print("Shutting down...")
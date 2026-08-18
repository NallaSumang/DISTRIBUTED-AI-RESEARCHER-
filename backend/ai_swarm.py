import os
import json
from typing import TypedDict, List
from dotenv import load_dotenv
load_dotenv(override=True)

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from duckduckgo_search import DDGS 

class AgentState(TypedDict):
    query: str
    sub_queries: List[str]
    raw_data: List[str]
    final_report: str

# Use groq/compound as it's the verified available model for this Groq account
llm = ChatGroq(
    model="groq/compound", 
    temperature=0, 
    api_key=os.getenv("GROQ_API_KEY")
)

from pydantic import BaseModel, Field

class SearchQueries(BaseModel):
    queries: List[str] = Field(description="List of 3 search queries")

def planner_agent(state: AgentState):
    print("   -> Planning...")
    prompt = f"Break this into 3 search queries: '{state['query']}'. Return ONLY a JSON list of strings."
    structured_llm = llm.with_structured_output(SearchQueries)
    try:
        res = structured_llm.invoke([HumanMessage(content=prompt)])
        queries = res.queries
    except Exception as e:
        print(f"   ⚠️ Planning parsing failed: {e}")
        queries = [state['query']]
    return {"sub_queries": queries}

import asyncio
from duckduckgo_search import AsyncDDGS

async def get_single_query(query):
    try:
        async with AsyncDDGS() as ddgs:
            return [f"Source: {r['href']}\n{r['body']}" async for r in ddgs.text(query, max_results=2)]
    except Exception as e:
        print(f"   ⚠️ Search failed for '{query}': {e}")
        return [f"Search failed for: {query}"]

def search_agent(state: AgentState):
    print(f"   -> Searching {len(state['sub_queries'])} sub-queries in parallel...")
    
    async def execute_parallel_research(sub_queries):
        tasks = [get_single_query(q) for q in sub_queries]
        return await asyncio.gather(*tasks)
    
    # Run the async code in a synchronous wrapper
    parallel_results = asyncio.run(execute_parallel_research(state['sub_queries']))
    
    # Flatten the results
    results = [item for sublist in parallel_results for item in sublist]
    
    if not results:
        results.append("No search results found. Generate report from existing knowledge.")
    return {"raw_data": results}

def writer_agent(state: AgentState):
    print("   -> Writing...")
    context = "\n\n".join(state['raw_data'])
    prompt = f"Write a professional Markdown report for: {state['query']}\n\nContext:\n{context}"
    res = llm.invoke([HumanMessage(content=prompt)])
    return {"final_report": res.content}

workflow = StateGraph(AgentState)
workflow.add_node("planner", planner_agent)
workflow.add_node("searcher", search_agent)
workflow.add_node("writer", writer_agent)
workflow.set_entry_point("planner")
workflow.add_edge("planner", "searcher")
workflow.add_edge("searcher", "writer")
workflow.add_edge("writer", END)
research_app = workflow.compile()

def execute_research(query: str):
    return research_app.invoke({"query": query, "sub_queries": [], "raw_data": [], "final_report": ""})['final_report']# trigger sync

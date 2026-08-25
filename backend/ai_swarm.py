import os
import re
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

# Planner: lightweight — only needs a short JSON list output
planner_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    max_tokens=512,
    api_key=os.getenv("GROQ_API_KEY")
)

# Writer: needs large output budget for full detailed reports
writer_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    max_tokens=8192,
    api_key=os.getenv("GROQ_API_KEY")
)

from pydantic import BaseModel, Field

class SearchQueries(BaseModel):
    queries: List[str] = Field(description="List of 3 search queries")

import json

def strip_thinking(text: str) -> str:
    """Remove <think>...</think> blocks emitted by reasoning models (e.g. Qwen3)."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

def planner_agent(state: AgentState):
    print("   -> Planning...")
    prompt = f"Break this into 3 search queries: '{state['query']}'. Return ONLY a raw JSON list of strings, with no other text, markdown, or schema."
    try:
        res = planner_llm.invoke([HumanMessage(content=prompt)])
        content = strip_thinking(res.content)
        if content.startswith("```json"):
            content = content[7:-3].strip()
        queries = json.loads(content)
        if not isinstance(queries, list):
            queries = [state['query']]
    except Exception as e:
        print(f"   ⚠️ Planning parsing failed: {e}")
        queries = [state['query']]
    return {"sub_queries": queries}

import asyncio
from duckduckgo_search import AsyncDDGS

async def get_single_query(query):
    try:
        tavily_key = os.getenv("TAVILY_API_KEY")
        if tavily_key:
            from tavily import AsyncTavilyClient
            client = AsyncTavilyClient(api_key=tavily_key)
            response = await client.search(query=query, max_results=4)
            return [f"Source: {r['url']}\n{r['content']}" for r in response['results']]
        else:
            async with AsyncDDGS() as ddgs:
                results = await ddgs.text(query, max_results=4)
                return [f"Source: {r['href']}\n{r['body']}" for r in results]
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
    # Truncate context to fit Qwen3's 32k context window
    if len(context) > 32000:
        context = context[:32000] + "... (truncated)"
    prompt = (
        f"Write a comprehensive, detailed, professional Markdown research report for: {state['query']}\n"
        f"Include all sections: overview, detailed analysis, key facts, examples, criticisms, and conclusion.\n"
        f"Do NOT stop early. Write the COMPLETE report.\n\n"
        f"Context:\n{context}"
    )
    res = writer_llm.invoke([HumanMessage(content=prompt)])
    return {"final_report": strip_thinking(res.content)}

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

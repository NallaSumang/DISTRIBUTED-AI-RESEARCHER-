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

# Llama 3.3 70B is the industry standard for reasoning in 2026
llm = ChatGroq(
    model="llama-3.3-70b-versatile", 
    temperature=0, 
    api_key=os.getenv("GROQ_API_KEY")
)

def planner_agent(state: AgentState):
    print("   -> Planning...")
    prompt = f"Break this into 3 search queries: '{state['query']}'. Return ONLY a JSON list of strings."
    res = llm.invoke([HumanMessage(content=prompt)])
    try:
        queries = json.loads(res.content.replace("```json", "").replace("```", "").strip())
    except:
        queries = [state['query']]
    return {"sub_queries": queries}

def search_agent(state: AgentState):
    print(f"   -> Searching...")
    results = []
    with DDGS() as ddgs:
        for q in state['sub_queries']:
            for r in ddgs.text(q, max_results=2):
                results.append(f"Source: {r['href']}\n{r['body']}")
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
    return research_app.invoke({"query": query, "sub_queries": [], "raw_data": [], "final_report": ""})['final_report']
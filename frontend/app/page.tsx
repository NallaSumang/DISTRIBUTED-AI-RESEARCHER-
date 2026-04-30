"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, BookOpen, Cpu, Sparkles, History, Globe, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [report, setReport] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Correctly handles the transition from local development to cloud production
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, ""); 

  // Function to pull "Memory" from Supabase
  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("research_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setHistory(data);
      if (error) console.error("Memory Fetch Error:", error);
    } catch (err) {
      console.error("Supabase connection failed:", err);
    }
  };

  useEffect(() => {
    fetchHistory(); // Load memory on startup
    let interval: NodeJS.Timeout;

    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/research/${jobId}`);
          const data = await res.json();
          if (data.status === "completed") {
            setReport(data.data);
            setLoading(false);
            setJobId(null);
            fetchHistory(); // Refresh sidebar when new research is done
            clearInterval(interval);
          }
        } catch (err) { 
          console.error("Polling failed:", err); 
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, loading]);

  const handleSearch = async () => {
    if (!query || loading) return;
    setLoading(true);
    setReport("");

    try {
      // Matches the POST expectation of your FastAPI backend
      const res = await fetch(`${API_BASE}/api/research`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }) 
      });

      if (!res.ok) throw new Error("Backend connection failed");

      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      console.error("Search Error:", err);
      alert("Backend Offline! Ensure your Hugging Face Space is 'Running'.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100 selection:bg-indigo-500/30 overflow-hidden font-sans">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* LEFT SIDEBAR: THE MEMORY */}
      <aside className="hidden xl:flex w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-3xl flex-col z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 text-indigo-400 mb-1">
            <History size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Memory</span>
          </div>
          <h2 className="text-lg font-bold">Recent Research</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.map((item) => (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id}
              onClick={() => setReport(item.report)}
              className="w-full text-left p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all group"
            >
              <p className="text-sm font-medium line-clamp-2 text-zinc-400 group-hover:text-zinc-100 transition-colors">
                {item.query}
              </p>
              <p className="text-[10px] text-zinc-600 mt-2 font-mono">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto p-8 md:p-16">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-2xl">
                <Cpu size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic">Swarm Intelligence</h1>
                <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Distributed Researcher v2.0</div>
              </div>
            </div>
            <div className="flex gap-3">
               <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold text-emerald-400 uppercase">
                 <Globe size={12} /> Live Search
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-bold text-indigo-400 uppercase">
                 <Zap size={12} /> Llama 3.3 Active
               </div>
            </div>
          </header>

          {/* SEARCH BOX */}
          <div className="group relative mb-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative flex items-center bg-zinc-900/80 border border-white/10 backdrop-blur-xl rounded-3xl p-2 pl-6">
              <Search className="text-zinc-500 mr-4" size={24} />
              <input
                type="text"
                className="w-full bg-transparent border-none py-5 text-xl font-medium focus:outline-none placeholder:text-zinc-700"
                placeholder="Analyze a topic in depth..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 px-10 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Execute"}
              </button>
            </div>
          </div>

          {/* RESULT AREA */}
          <AnimatePresence mode="wait">
            {loading && !report && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
                <div className="inline-block relative mb-6">
                   <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
                <p className="text-xl font-bold">Synthesizing Intelligence...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-10 md:p-16 shadow-3xl">
                <div className="flex items-center gap-3 mb-12 pb-6 border-b border-white/5">
                  <BookOpen className="text-indigo-400" size={24} />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Analysis Summary</h2>
                </div>
                <article className="prose prose-invert prose-indigo max-w-none">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </article>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

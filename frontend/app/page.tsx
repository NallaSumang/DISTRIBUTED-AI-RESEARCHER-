"use client";
import { useState, useEffect, useCallback } from "react";
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

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"; 

  // Function to pull "Memory" from Supabase
  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("research_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) setHistory(data);
    if (error) console.error("Memory Fetch Error:", error);
  }, []);

  useEffect(() => {
    fetchHistory(); // Load memory on startup
    let interval: NodeJS.Timeout;
    let pollCount = 0;
    const MAX_POLLS = 150; // 5 minutes at 2s intervals

    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          pollCount++;
          if (pollCount > MAX_POLLS) {
            setReport("### Timeout Error\n\nThe research agent took too long to respond. The HuggingFace Space might be waking up or overloaded.");
            setLoading(false);
            setJobId(null);
            clearInterval(interval);
            return;
          }

          const res = await fetch(`${API_BASE}/api/research/${jobId}`);
          const data = await res.json();
          
          if (data.status === "completed" || data.status === "failed") {
            setReport(data.data);
            setLoading(false);
            setJobId(null);
            if (data.status === "completed") {
                fetchHistory(); // Refresh sidebar when new research is done
            }
            clearInterval(interval);
          }
        } catch (err) { console.error("Polling failed:", err); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, loading, fetchHistory]);

  const handleSearch = async () => {
    if (!query || loading) return;
    setLoading(true);
    setReport("");
    try {
      const res = await fetch(`${API_BASE}/api/research?query=${encodeURIComponent(query)}`, { method: "POST" });
      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      alert("Backend Offline! Ensure main.py is running.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-300 selection:bg-red-900/30 font-sans tracking-wide">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-950/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* LEFT SIDEBAR: THE MEMORY */}
      <aside className="hidden xl:flex w-80 border-r border-white/[0.02] bg-white/[0.01] backdrop-blur-3xl flex-col z-20">
        <div className="p-10 border-b border-white/[0.02]">
          <div className="flex items-center gap-4 text-red-900/80 mb-2">
            <History size={16} />
            <span className="text-[9px] font-medium uppercase tracking-[0.3em]">Neural Memory</span>
          </div>
          <h2 className="text-sm font-light tracking-widest text-zinc-100">Recent Research</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {history.map((item) => (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id}
              onClick={() => setReport(item.report)}
              className="w-full text-left p-5 rounded-2xl bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.03] hover:border-red-900/20 transition-all duration-700 group"
            >
              <p className="text-xs font-light leading-relaxed line-clamp-2 text-zinc-500 group-hover:text-zinc-200 transition-colors duration-500">
                {item.query}
              </p>
              <p className="text-[9px] text-zinc-700 mt-3 font-mono tracking-widest">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-10 md:p-20">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-br from-red-950 to-[#050505] border border-white/[0.05] p-4 rounded-2xl shadow-[0_0_30px_rgba(127,29,29,0.1)]">
                <Cpu size={24} className="text-red-800" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-light tracking-[0.1em] text-zinc-100">SWARM INTELLIGENCE</h1>
                <div className="text-[9px] font-medium text-red-900/80 tracking-[0.4em] uppercase mt-1">Distributed Researcher</div>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.03] bg-white/[0.01] text-[9px] font-medium text-zinc-400 tracking-widest uppercase transition-colors hover:bg-white/[0.02]">
                 <Globe size={12} strokeWidth={1.5} /> Live Search
               </div>
               <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-900/20 bg-red-950/20 text-[9px] font-medium text-red-700/80 tracking-widest uppercase shadow-[0_0_15px_rgba(127,29,29,0.1)]">
                 <Zap size={12} strokeWidth={1.5} /> Llama 3.3
               </div>
            </div>
          </header>

          {/* SEARCH BOX */}
          <div className="group relative mb-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-950 to-transparent rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative flex items-center bg-[#050505]/80 border border-white/[0.04] backdrop-blur-3xl rounded-3xl p-2 pl-8 shadow-2xl">
              <Search className="text-zinc-600 mr-4" size={20} strokeWidth={1.5} />
              <input
                type="text"
                className="w-full bg-transparent border-none py-6 text-lg font-light text-zinc-100 focus:outline-none placeholder:text-zinc-700 tracking-wide"
                placeholder="Analyze a topic in depth..."
                value={query}
                maxLength={2000}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-zinc-100 text-black hover:bg-white disabled:bg-[#0a0a0a] disabled:text-zinc-700 px-12 py-6 rounded-2xl text-xs font-semibold transition-all duration-700 disabled:border disabled:border-white/[0.02] shadow-[0_0_20px_rgba(255,255,255,0.05)] uppercase tracking-[0.2em]"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Execute"}
              </button>
            </div>
          </div>

          {/* RESULT AREA */}
          <AnimatePresence mode="wait">
            {loading && !report && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="py-32 text-center">
                <div className="inline-block relative mb-8">
                   <div className="w-12 h-12 border border-white/[0.05] border-t-red-900/50 rounded-full animate-spin duration-1000" />
                </div>
                <p className="text-sm font-light tracking-[0.2em] text-zinc-500 uppercase">Synthesizing Intelligence...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white/[0.01] border border-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-12 md:p-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-16 pb-8 border-b border-white/[0.02]">
                  <BookOpen className="text-red-900/60" size={20} strokeWidth={1.5} />
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">Analysis Summary</h2>
                </div>
                <article className="prose prose-invert prose-p:font-light prose-p:leading-loose prose-a:text-red-800 prose-a:font-normal prose-headings:font-light max-w-none text-zinc-300">
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
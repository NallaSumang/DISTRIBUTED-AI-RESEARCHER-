"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, BookOpen, Cpu, History, Globe, Zap } from "lucide-react";
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

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, ""); 

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
    fetchHistory(); 
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
            fetchHistory(); 
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
      alert("System Offline: Connection to the Grid failed.");
      setLoading(false);
    }
  };

  return (
    // flex-col-reverse stacks History on the bottom for mobile, xl:flex-row puts it on the left for desktop
    <div className="flex flex-col-reverse xl:flex-row min-h-screen bg-[#030000] text-red-50 selection:bg-red-600/40 overflow-x-hidden font-sans">
      
      {/* TRON NEON BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-700/10 rounded-full blur-[150px]" />
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      {/* SIDEBAR: NEURAL MEMORY (Now responsive) */}
      <aside className="flex w-full xl:w-80 border-t xl:border-t-0 xl:border-r border-red-900/50 bg-black/40 backdrop-blur-3xl flex-col z-20 xl:h-screen min-h-[40vh] xl:min-h-0 shadow-[4px_0_24px_rgba(220,38,38,0.05)]">
        <div className="p-6 xl:p-8 border-b border-red-900/50">
          <div className="flex items-center gap-3 text-red-500 mb-1">
            <History size={18} className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Logs</span>
          </div>
          <h2 className="text-lg font-bold text-red-100">Cycle History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.map((item) => (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id}
              onClick={() => {
                setReport(item.report);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top on mobile click
              }}
              className="w-full text-left p-4 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)] transition-all group"
            >
              <p className="text-sm font-medium line-clamp-2 text-red-200/70 group-hover:text-red-100 transition-colors">
                {item.query}
              </p>
              <p className="text-[10px] text-red-500/50 mt-2 font-mono uppercase">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar xl:h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-12 xl:p-16">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 xl:mb-16 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-black p-3 rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <Cpu size={28} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Swarm System</h1>
                <div className="text-[10px] font-bold text-red-500 tracking-[0.3em] uppercase drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">Distributed Node v2.0</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
               <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-500/30 bg-red-950/30 text-[10px] font-bold text-red-400 uppercase shadow-[0_0_10px_rgba(220,38,38,0.1)]">
                 <Globe size={12} className="animate-pulse" /> Uplink Active
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-rose-500/30 bg-rose-950/30 text-[10px] font-bold text-rose-400 uppercase shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                 <Zap size={12} /> Llama Core
               </div>
            </div>
          </header>

          {/* SEARCH BOX */}
          <div className="group relative mb-12 xl:mb-16">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500" />
            <div className="relative flex flex-col md:flex-row items-center bg-black/80 border border-red-500/20 backdrop-blur-xl rounded-2xl p-2 md:pl-6 gap-2 md:gap-0">
              <Search className="text-red-600 hidden md:block mr-4 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" size={24} />
              <input
                type="text"
                className="w-full bg-transparent border-none py-4 md:py-5 px-4 md:px-0 text-lg md:text-xl font-medium text-white focus:outline-none placeholder:text-red-900/50"
                placeholder="Initialize directive..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full md:w-auto bg-red-600 text-white hover:bg-red-500 disabled:bg-red-950 disabled:text-red-900/50 px-10 py-4 md:py-5 rounded-xl font-black transition-all active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] uppercase tracking-widest border border-red-400/50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Execute"}
              </button>
            </div>
          </div>

          {/* RESULT AREA */}
          <AnimatePresence mode="wait">
            {loading && !report && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
                <div className="inline-block relative mb-6">
                   <div className="w-16 h-16 border-4 border-red-950 border-t-red-500 rounded-full animate-spin drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                </div>
                <p className="text-xl font-bold text-red-400 tracking-widest uppercase animate-pulse">Processing Cycles...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-black/60 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 md:p-12 shadow-[0_0_40px_rgba(220,38,38,0.05)] relative overflow-hidden">
                {/* Internal UI Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-red-900/30">
                  <BookOpen className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" size={24} />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-red-400">Decoded Output</h2>
                </div>
                <article className="prose prose-invert max-w-none prose-p:text-red-50/80 prose-headings:text-white prose-a:text-red-400 prose-strong:text-red-200 prose-code:text-rose-300">
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

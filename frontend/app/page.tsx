"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, BookOpen, Cpu, Sparkles, History, Globe, Zap, Brain } from "lucide-react";
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

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:7860"; 

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
    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/research/${jobId}`);
          if (!res.ok) throw new Error("Polling failed");
          const data = await res.json();
          if (data.status === "completed") {
            setReport(data.data);
            setLoading(false);
            setJobId(null);
            fetchHistory(); // Refresh sidebar when new research is done
            clearInterval(interval);
          } else if (data.status === "failed") {
            setReport(data.data || "### Error\nResearch failed.");
            setLoading(false);
            setJobId(null);
            clearInterval(interval);
          }
        } catch (err) { 
          console.error("Polling failed:", err); 
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, loading, fetchHistory]);

  const handleSearch = async () => {
    if (!query || loading) return;
    setLoading(true);
    setReport("");
    try {
      const res = await fetch(`${API_BASE}/api/research`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.job_id) throw new Error("No job ID returned");
      setJobId(data.job_id);
    } catch (err) {
      alert("Backend Offline! Ensure main.py is running on port 7860.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-300 selection:bg-red-900/30 font-sans tracking-wide">
      
      {/* 3D DRAGONIC CYBER-GRID & EMBERS (ANIME VIBE) */}
      <div className="fixed inset-0 z-0 bg-[#030000] overflow-hidden pointer-events-none">
        <style>{`
          @keyframes grid-pan {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes scan-line {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
          }
          @keyframes float-ember {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          }
        `}</style>

        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0000_0%,#000000_100%)]" />

        {/* 3D Moving Grid */}
        <div className="absolute inset-0 [perspective:1000px]">
          <div className="absolute inset-0 origin-bottom [transform:rotateX(60deg)_translateZ(-200px)] opacity-50">
            <div className="absolute inset-[-100%] animate-[grid-pan_4s_linear_infinite] bg-[linear-gradient(to_right,#ff000040_1px,transparent_1px),linear-gradient(to_bottom,#ff000040_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>
        </div>

        {/* Anime HUD Scanline */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[scan-line_6s_ease-in-out_infinite] shadow-[0_0_20px_rgba(255,0,0,0.8)]" />

        {/* Floating Embers (Dragon Vibe) */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_20px_5px_rgba(255,0,0,0.9)] animate-[float-ember_4s_ease-in-out_infinite]" />
        <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_25px_6px_rgba(255,100,0,0.9)] animate-[float-ember_6s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-[15%] w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_15px_4px_rgba(255,200,0,0.9)] animate-[float-ember_5s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_20px_5px_rgba(255,0,0,0.9)] animate-[float-ember_7s_ease-in-out_infinite_0.5s]" />

        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />
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

      {/* MAIN CONTENT */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-16 pt-8 md:pt-16">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-6 md:gap-0">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-red-950 to-[#050505] border border-white/[0.05] p-3 rounded-2xl shadow-[0_0_30px_rgba(127,29,29,0.1)]">
                <Brain className="text-red-700/80" size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-light tracking-[0.1em] text-zinc-100 mb-1">D<span className="text-red-900/60">/</span>AI</h1>
                <div className="text-[9px] font-medium text-red-900/80 tracking-[0.4em] uppercase mt-1">Distributed Researcher</div>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/[0.03] bg-white/[0.01] text-[9px] font-medium text-zinc-400 tracking-widest uppercase transition-colors hover:bg-white/[0.02]">
                 <Globe size={12} strokeWidth={1.5} /> Live Search
               </div>
               <div className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-red-900/20 bg-red-950/20 text-[9px] font-medium text-red-700/80 tracking-widest uppercase shadow-[0_0_15px_rgba(127,29,29,0.1)]">
                 <Zap size={12} strokeWidth={1.5} /> Llama 3.3
               </div>
            </div>
          </header>

          {/* SEARCH BOX */}
          <div className="group relative mb-12 md:mb-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-950 to-transparent rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#050505]/80 border border-white/[0.04] backdrop-blur-3xl rounded-3xl p-2 md:pl-8 shadow-2xl gap-2 md:gap-0">
              <div className="flex items-center flex-1 px-4 md:px-0">
                <Search className="text-zinc-600 mr-3 md:mr-4 shrink-0" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  className="w-full bg-transparent border-none py-4 md:py-6 text-base md:text-lg font-light text-zinc-100 focus:outline-none placeholder:text-zinc-700 tracking-wide"
                  placeholder="Analyze a topic in depth..."
                  value={query}
                  maxLength={2000}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-zinc-100 text-black hover:bg-white disabled:bg-[#0a0a0a] disabled:text-zinc-700 px-6 py-4 md:px-12 md:py-6 rounded-2xl text-xs font-semibold transition-all duration-700 disabled:border disabled:border-white/[0.02] shadow-[0_0_20px_rgba(255,255,255,0.05)] uppercase tracking-[0.2em] w-full md:w-auto"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Execute"}
              </button>
            </div>
          </div>

          {/* RESULT AREA */}
          <AnimatePresence mode="wait">
            {loading && !report && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="py-20 md:py-32 text-center">
                <div className="inline-block relative mb-8">
                   <div className="w-10 h-10 md:w-12 md:h-12 border border-white/[0.05] border-t-red-900/50 rounded-full animate-spin duration-1000" />
                </div>
                <p className="text-xs md:text-sm font-light tracking-[0.2em] text-zinc-500 uppercase">Synthesizing Intelligence...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white/[0.01] border border-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-6 md:p-12 lg:p-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-8 md:mb-16 pb-6 md:pb-8 border-b border-white/[0.02]">
                  <BookOpen className="text-red-900/60" size={20} strokeWidth={1.5} />
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">Analysis Summary</h2>
                </div>
                <article className="prose prose-invert prose-p:font-light prose-p:leading-loose prose-a:text-red-800 prose-a:font-normal prose-headings:font-light max-w-none text-zinc-300 break-words">
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
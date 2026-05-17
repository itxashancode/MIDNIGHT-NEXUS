"use client";

import { Info } from "lucide-react";
import GemmaLogo from "@/components/GemmaLogo";
import { cn } from "@/lib/utils";
import { useReasoningStore } from "@/store/useReasoningStore";

export default function DashboardNav() {
  const {
    appState,
    exchanges,
    currentMessage,
    currentAnswer,
    currentThoughts,
    clearHistory,
    protocol,
    setProtocol
  } = useReasoningStore();

  
  const totalTokens = Math.floor((
    exchanges.reduce((acc, ex) => acc + ex.userMessage.length + ex.answer.length, 0) + 
    currentMessage.length + 
    currentAnswer.length + 
    currentThoughts.reduce((acc, t) => acc + t.content.length, 0)
  ) / 4).toLocaleString();

  const totalNodes = exchanges.reduce((acc, ex) => acc + ex.thoughts.length, 0) + currentThoughts.length;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[1200px] px-6 z-[500]">
      <nav className="solidroad-nav grid grid-cols-2 md:grid-cols-3 items-center px-4 md:px-10 backdrop-blur-xl bg-background/70 border border-white/[0.04] rounded-2xl">
        <div className="hidden md:flex items-center justify-start gap-6">
          <div className="group relative">
            <div className="flex items-center gap-3 cursor-help opacity-60 hover:opacity-100 transition-opacity">
              <Info className="w-4 h-4 text-primary/70" />
              <span className="text-[11px] font-light text-muted uppercase tracking-widest">Service Details</span>
            </div>
            <div className="absolute left-0 top-full mt-5 w-80 p-5 rounded-2xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[300] text-left">
              <p className="text-[13px] leading-relaxed text-muted font-light tracking-normal normal-case">
                <strong className="text-primary block mb-2 text-sm uppercase tracking-wider">Guided Reasoning Service</strong>
                MIDNIGHT NEXUS provides a high-fidelity partnership with **Gemma 4**, allowing you to refine and co-create complex intelligence streams.
              </p>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] font-light text-muted uppercase tracking-widest">
                <span>Protocol: RIP v1.0</span>
                <span className="text-primary font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 p-1 rounded-full bg-white/[0.02] border border-white/[0.04] relative group/protocol">
            <button 
              onClick={() => setProtocol("cloud")}
              className={cn(
                "px-3 py-1 rounded-full text-[9px] font-light uppercase tracking-wider transition-all",
                protocol === "cloud" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
              )}
            >
              Cloud
            </button>
            <button 
              onClick={() => setProtocol("local")}
              className={cn(
                "px-3 py-1 rounded-full text-[9px] font-light uppercase tracking-wider transition-all",
                protocol === "local" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
              )}
            >
              Local
            </button>

            {protocol === "local" && (
              <div className="absolute top-full left-0 mt-4 w-72 p-4 rounded-2xl bg-background border border-border shadow-2xl opacity-0 translate-y-2 group-hover/protocol:opacity-100 group-hover/protocol:translate-y-0 transition-all pointer-events-none group-hover/protocol:pointer-events-auto z-[600]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-light uppercase tracking-widest">Local Setup Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted font-light">
                    To enable true on-device inference, run Gemma 4 locally via **Ollama** or **gemma.cpp**:
                  </p>
                  <div className="p-2 rounded-lg bg-black/50 font-mono text-[9px] text-primary/80 border border-white/5">
                    ollama run gemma:2b-instruct
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted italic font-light">
                    Note: The current demo simulates local system constraints via system prompting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-start md:justify-center gap-3">
          <div className="flex items-center gap-3">
            <GemmaLogo size={32} priority />
            <span className="font-heading font-light text-lg md:text-xl tracking-tight uppercase">MIDNIGHT NEXUS</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 md:gap-10">
          <div className="flex flex-col items-end group relative cursor-help">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-light text-primary uppercase tracking-[0.2em]">Entropy</span>
              <div className={cn(
                "w-1 h-3 rounded-full transition-all duration-300",
                appState === "streaming" ? "bg-primary animate-pulse" : "bg-muted"
              )} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-light text-foreground tabular-nums">
                {totalTokens}
              </span>
              <span className="text-[10px] font-light text-primary/60">TK</span>
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all text-left z-[300]">
              <p className="text-[10px] leading-relaxed text-muted font-light">
                Real-time measurement of system disorder.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end group relative cursor-help">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-light text-primary uppercase tracking-[0.2em]">Context</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                ))}
              </div>
            </div>
            <span className="text-xs md:text-sm font-mono font-light text-foreground tabular-nums">
              128<span className="text-[11px] ml-0.5 opacity-60">k</span>
            </span>
            <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all text-left z-[300]">
              <p className="text-[10px] leading-relaxed text-muted font-light">
                Gemma 4 Native Long Context enabled.
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-border/40" />

          <div className="hidden sm:flex flex-col items-end group relative cursor-help">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-light text-primary uppercase tracking-[0.2em]">Nodes</span>
              <div className={cn(
                "w-2 h-2 rounded-full border border-primary/40",
                (currentThoughts.length > 0 || appState === "streaming") && "bg-primary animate-ping"
              )} />
            </div>
            <span className="text-xs md:text-sm font-mono font-light text-foreground tabular-nums">
              {totalNodes}
            </span>
            <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all text-left z-[300]">
              <p className="text-[10px] leading-relaxed text-muted font-light">
                Active reasoning nodes.
              </p>
            </div>
          </div>
        </div>
      </nav>
      {exchanges.length > 0 && (
        <div className="mt-2 pl-6 md:pl-10 flex justify-start">
          <button
            onClick={clearHistory}
            aria-label="Clear all intelligence history"
            className="text-[11px] font-light uppercase tracking-widest text-muted hover:text-destructive transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Brain, ArrowRight, Activity, Plus } from "lucide-react";
import Timer from "@/components/Timer";
import ThoughtBubble from "@/components/ThoughtBubble";

export type Thought = {
  id: string;
  content: string;
  originalContent: string | null;
  isStreaming: boolean;
};

interface ThoughtStreamProps {
  thoughts: Thought[];
  setThoughts: (thoughts: Thought[]) => void;
  isStreaming: boolean;
  onCollapse: () => void;
}

export default function ThoughtStream({
  thoughts,
  setThoughts,
  isStreaming,
  onCollapse: onCollapseProp,
}: ThoughtStreamProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [committed, setCommitted] = useState(false);
  const isAllFilled = thoughts.length > 0 && thoughts.every((t) => !t.isStreaming);

  const handleCollapse = () => {
    setIsCollapsed(true);
    setCommitted(true);
    onCollapseProp();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-accent/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(0,255,224,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="nx-label text-sm font-bold tracking-tight text-foreground">Neural Interception</h3>
            <div className="flex items-center gap-2 nx-meta uppercase tracking-widest">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Live Nexus Stream
              <span className="mx-2 opacity-20">|</span>
              <span className="text-accent font-bold">
                {Math.floor(thoughts.reduce((acc, t) => acc + t.content.length, 0) / 4)} 
                <span className="ml-1 opacity-50">Node Depth</span>
              </span>
            </div>
          </div>
        </div>
        {!committed && (
          <Timer onComplete={handleCollapse} isActive={!isStreaming && !isCollapsed} />
        )}
      </div>

      <motion.div 
        animate={{ 
          height: isCollapsed ? 0 : "auto", 
          opacity: isCollapsed ? 0 : 1,
          scale: isCollapsed ? 0.95 : 1,
          filter: isCollapsed ? "blur(20px)" : "blur(0px)"
        }}
        transition={{ 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1]
        }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 gap-3 relative">

          <Reorder.Group
            axis="y"
            values={thoughts}
            onReorder={setThoughts}
            className="flex flex-col gap-3 relative z-10"
          >
            {thoughts.map((thought) => (
              <Reorder.Item
                key={thought.id}
                value={thought}
                dragListener={!isStreaming && !isCollapsed}
              >
                <ThoughtBubble
                  thought={thought}
                  isLocked={isStreaming || isCollapsed}
                  onDelete={() => {}} // Handled by parent
                  onEdit={() => {}} // Handled by parent
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {!isStreaming && !isCollapsed && (
            <button
              onClick={() => {
                const newId = `manual-${Date.now()}`;
                setThoughts([
                  ...thoughts,
                  {
                    id: newId,
                    content: "Intercepting neural pathway...",
                    originalContent: null,
                    isStreaming: false
                  }
                ]);
              }}
              className="mt-2 w-full p-6 nx-glass-card border-dashed border-accent/20 hover:border-accent/40 flex items-center justify-center gap-3 text-muted hover:text-accent transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="nx-label text-[10px] font-bold uppercase tracking-[0.2em]">Inject Neural Bridge</span>
            </button>
          )}

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {[1, 2].map((i) => (
                <div key={`skeleton-${i}`} className="group relative flex flex-col gap-2 p-6 nx-glass-card border-accent/10 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent/20" />
                    <div className="h-2 w-24 bg-accent/10 rounded-full" />
                  </div>
                  <div className="relative mt-2">
                    <div className="h-3 w-3/4 bg-accent/10 rounded-full mb-3" />
                    <div className="h-3 w-1/2 bg-accent/10 rounded-full" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAllFilled && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-12 border-t border-accent/10 mt-6"
          >
            <div className="flex flex-col items-center text-center max-w-[400px]">
              <p className="nx-display text-lg font-bold text-foreground mb-2">Protocol Ready</p>
              <p className="nx-body text-sm text-muted/70 leading-relaxed">Neural nodes have been intercepted and verified. Commit the sequence to synthesize intelligence.</p>
            </div>
            
            <button
              onClick={(e) => {
                e.currentTarget.disabled = true;
                const span = e.currentTarget.querySelector('span');
                if (span) span.innerText = "Synthesizing...";
                handleCollapse();
              }}
              className="group relative z-50 flex items-center gap-4 px-10 py-4 bg-accent text-void font-bold rounded-sm shadow-2xl shadow-accent/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="nx-label text-xs uppercase tracking-widest">Commit Sequence</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
}

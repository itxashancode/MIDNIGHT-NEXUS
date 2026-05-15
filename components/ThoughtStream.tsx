"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import ThoughtBubble from "./ThoughtBubble";
import Timer from "./Timer";
import { Brain, ArrowRight, Activity, Plus } from "lucide-react";

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

  const handleDelete = (id: string) => {
    setThoughts(thoughts.filter(t => t.id !== id));
  };

  const onCollapse = () => {
    setIsCollapsed(true);
    setCommitted(true);
    onCollapseProp();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-subheading font-bold tracking-tight text-foreground">Intelligence Lab</h3>
            <div className="flex items-center gap-2 text-[10px] text-muted font-mono uppercase tracking-widest">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live Reasoning Stream
              <span className="mx-2 opacity-20">|</span>
              <span className="text-primary font-bold">
                {Math.floor(thoughts.reduce((acc, t) => acc + t.content.length, 0) / 4)} 
                <span className="ml-1 opacity-50">Intelligence Depth</span>
              </span>
            </div>
          </div>
        </div>
        {!committed && (
          <Timer onComplete={onCollapse} isActive={!isStreaming && !isCollapsed} duration={20} />
        )}
      </div>

      <motion.div 
        animate={{ 
          height: isCollapsed ? 0 : "auto", 
          opacity: isCollapsed ? 0 : 1,
          scale: isCollapsed ? 0.95 : 1,
          filter: isCollapsed ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.23, 1, 0.32, 1] // Aggressive quint ease
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
                  onDelete={() => handleDelete(thought.id)}
                  onEdit={(newContent) => {
                    const newThoughts = thoughts.map((t) =>
                      t.id === thought.id
                        ? {
                            ...t,
                            content: newContent,
                            originalContent: t.originalContent === null ? t.content : t.originalContent,
                          }
                        : t
                    );
                    setThoughts(newThoughts);
                  }}
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
                    content: "New neural pathway...",
                    originalContent: null,
                    isStreaming: false
                  }
                ]);
              }}
              className="mt-2 w-full p-4 border border-dashed border-border hover:border-primary/40 rounded-2xl flex items-center justify-center gap-2 text-muted hover:text-primary bg-transparent hover:bg-primary/5 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-subheading font-bold uppercase tracking-widest">Inject Neural Link</span>
            </button>
          )}

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {[1, 2].map((i) => (
                <div key={`skeleton-${i}`} className="group relative flex flex-col gap-2 p-4 rounded-2xl border bg-muted/10 border-border animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-muted/40" />
                      <div className="h-3 w-24 bg-muted/30 rounded" />
                    </div>
                  </div>
                  <div className="relative mt-2">
                    <div className="h-4 w-3/4 bg-muted/20 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-muted/20 rounded" />
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
            className="flex flex-col items-center gap-4 py-8 border-t border-border mt-4"
          >
            <div className="flex flex-col items-center text-center max-w-[300px]">
              <p className="text-sm font-subheading font-bold text-foreground mb-1">Reasoning Stabilized</p>
              <p className="text-[12px] text-muted font-body">You have intercepted the star&apos;s light. Collapse these thoughts to generate the final response.</p>
            </div>
            
            <button
              onClick={(e) => {
                e.currentTarget.disabled = true;
                const span = e.currentTarget.querySelector('span');
                if (span) span.innerText = "Collapsing...";
                onCollapse();
              }}
              className="group relative z-50 flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>Commit Intelligence</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

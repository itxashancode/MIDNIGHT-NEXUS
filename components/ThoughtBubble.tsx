"use client";

import { motion } from "framer-motion";
import { Edit2, Sparkles, AlertCircle, Trash2, Globe, GripVertical, Check } from "lucide-react";
import { useState, useMemo } from "react";
import * as Diff from "diff";

interface Thought {
  id: string;
  content: string;
  originalContent: string | null;
  isStreaming: boolean;
}

interface ThoughtBubbleProps {
  thought: Thought;
  onEdit: (newContent: string) => void;
  onDelete: () => void;
  isLocked: boolean;
}

export default function ThoughtBubble({ thought, onEdit, onDelete, isLocked }: ThoughtBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(thought.content);

  const isChanged = thought.originalContent !== null && thought.originalContent !== thought.content;
  const isWebSearch = thought.content.toLowerCase().includes("tavilysearch") || thought.content.toLowerCase().includes("web_search");

  const diff = useMemo(() => {
    if (!isChanged || !thought.originalContent) return null;
    return Diff.diffWords(thought.originalContent, thought.content);
  }, [isChanged, thought.originalContent, thought.content]);

  const handleSave = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative flex flex-col gap-2 p-6 rounded-3xl border transition-all duration-500 ${
        thought.isStreaming 
          ? "bg-primary/5 border-primary/20 animate-pulse" 
          : isChanged 
            ? "glass-panel border-primary shadow-[0_0_40px_rgba(48,145,255,0.15)] bg-primary/10" 
            : "glass-panel border-white/5 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isLocked && !thought.isStreaming && (
            <div className="cursor-grab active:cursor-grabbing text-muted/20 hover:text-primary transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          {thought.isStreaming ? (
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          ) : isWebSearch ? (
            <Globe className="w-4 h-4 text-primary" />
          ) : (
            <Sparkles className={`w-4 h-4 ${isChanged ? "text-primary" : "text-muted"}`} />
          )}
          <span className="text-[10px] font-subheading font-bold uppercase tracking-[0.2em] text-primary">
            {thought.isStreaming ? "Streaming Intelligence" : isWebSearch ? "Protocol Action" : isChanged ? "Nexus Override" : "Neural Node"}
          </span>
          {isWebSearch && !thought.isStreaming && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/20">
              Web Intelligence
            </span>
          )}
        </div>

        {!isLocked && !thought.isStreaming && (
          <div className="flex items-center gap-2">
            {!isEditing && !isChanged && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mr-2 animate-pulse flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-3 h-3" />
                <span className="hidden sm:inline">Intercept</span>
              </span>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button
                onClick={() => {
                  setEditValue(thought.content);
                  setIsEditing(!isEditing);
                }}
                className="p-2 rounded-xl glass-panel hover:text-primary transition-all"
                title="Edit thought"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-xl glass-panel hover:text-destructive transition-all"
                title="Remove node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[1000] cursor-default pointer-events-auto"
          onClick={() => setIsEditing(false)}
        />
      )}

      {isEditing ? (
        <div className="flex flex-col gap-4 mt-2 relative z-[1001]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-subheading font-bold uppercase tracking-[0.2em] text-primary">Interception Active • Modifying Neural Sequence</span>
          </div>
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            maxLength={1000}
            placeholder="Redefine this reasoning node..."
            className="w-full glass-panel border-primary rounded-[32px] p-8 text-xl font-body font-medium outline-none min-h-[200px] resize-none shadow-2xl shadow-primary/20 focus:ring-4 focus:ring-primary/10 transition-all"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-8 py-3 text-[10px] font-subheading font-bold text-muted hover:text-foreground transition-colors uppercase tracking-[0.2em]"
            >
              Abort Sequence
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center gap-3"
            >
              <Check className="w-4 h-4" />
              Commit Logic
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isChanged && diff ? (
            <div className="text-lg leading-relaxed font-body font-medium mt-2">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.added
                      ? "text-primary font-bold bg-primary/10 px-1 rounded-lg"
                      : part.removed
                      ? "text-destructive/30 line-through decoration-destructive/20"
                      : "text-foreground/90"
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          ) : (
            <p className={`text-lg leading-relaxed font-body font-medium mt-2 ${isChanged ? "text-primary font-bold" : "text-foreground"}`}>
              {thought.content}
            </p>
          )}
          
          {isChanged && (
            <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest opacity-60">
                <AlertCircle className="w-3 h-3" />
                <span>Sequence Altered • ZK-Verified Override</span>
              </div>
              <span className="text-[10px] font-mono text-muted tabular-nums opacity-40">
                DELTA_IDX: {Math.abs(thought.content.length - (thought.originalContent?.length || 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

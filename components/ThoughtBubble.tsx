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
      className={`group relative flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-300 ${
        thought.isStreaming 
          ? "bg-muted/40 border-primary/30 animate-pulse" 
          : isChanged 
            ? "bg-primary/5 border-primary/40 shadow-[0_0_20px_rgba(48,145,255,0.05)]" 
            : "bg-muted/10 border-border hover:bg-muted/20 hover:border-primary/50 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isLocked && !thought.isStreaming && (
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors mr-1">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          {thought.isStreaming ? (
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          ) : isWebSearch ? (
            <Globe className="w-3.5 h-3.5 text-blue-500" />
          ) : (
            <Sparkles className={`w-3.5 h-3.5 ${isChanged ? "text-primary" : "text-muted-foreground"}`} />
          )}
          <span className="text-[10px] font-subheading font-bold uppercase tracking-widest text-primary/80">
            {thought.isStreaming ? "Synthesizing..." : isWebSearch ? "Action Node" : isChanged ? "Intelligence Override" : "Neural Path"}
          </span>
          {isWebSearch && !thought.isStreaming && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-wider border border-blue-500/20">
              Web Search
            </span>
          )}
        </div>

        {!isLocked && !thought.isStreaming && (
          <div className="flex items-center gap-1 opacity-100 transition-all">
            {!isEditing && !isChanged && (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary mr-1 sm:mr-2 animate-pulse flex items-center gap-1 opacity-70 group-hover:opacity-100">
                <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Intercept</span>
                <span className="sm:hidden">Edit</span>
              </span>
            )}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
              <button
              onClick={() => {
                setEditValue(thought.content);
                setIsEditing(!isEditing);
              }}
              className="p-1.5 rounded-lg hover:bg-muted text-muted hover:text-primary transition-all"
              title="Edit thought"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-all"
              title="Remove node"
            >
              <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] cursor-default pointer-events-auto"
          onClick={() => setIsEditing(false)}
        />
      )}

      {isEditing ? (
        <div className="flex flex-col gap-3 mt-1 relative z-[160]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-subheading font-bold uppercase tracking-widest text-primary">Interception Active: Modifying Neural Logic</span>
          </div>
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            maxLength={500}
            placeholder="Redefine this reasoning node..."
            className="w-full bg-background border-2 border-primary rounded-xl p-4 text-[15px] font-body font-medium focus:ring-8 focus:ring-primary/10 outline-none min-h-[140px] resize-none shadow-[0_20px_50px_rgba(48,145,255,0.3)]"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-[11px] font-subheading font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Abort
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground text-[11px] font-bold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              Commit Logic
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isChanged && diff ? (
            <div className="text-[15px] leading-relaxed font-body font-medium">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.added
                      ? "text-primary font-bold bg-primary/20 px-0.5 rounded"
                      : part.removed
                      ? "text-red-500/50 line-through decoration-red-500/30"
                      : "text-foreground/90"
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          ) : (
            <p className={`text-[15px] leading-relaxed font-body font-medium ${isChanged ? "text-primary font-bold" : "text-foreground"}`}>
              {thought.content}
            </p>
          )}
          
          {isChanged && (
            <div className="mt-3 flex items-center justify-between border-t border-primary/10 pt-2">
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-primary/60 uppercase tracking-tighter">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>Deterministic Path Altered</span>
              </div>
              <span className="text-[9px] font-mono text-muted tabular-nums">
                LEV_DIST: {Math.abs(thought.content.length - (thought.originalContent?.length || 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

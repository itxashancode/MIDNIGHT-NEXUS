"use client";

import { motion } from "framer-motion";
import { Edit2, Sparkles, AlertCircle, Trash2, Globe, GripVertical, Check } from "lucide-react";
import { useState, useMemo } from "react";
import * as Diff from "diff";

import { Thought } from "@/components/ThoughtStream";

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative flex flex-col gap-2 p-6 nx-glass-card transition-all duration-500 ${
        thought.isStreaming 
          ? "bg-accent/5 border-accent/20 animate-pulse" 
          : isChanged 
            ? "border-accent shadow-[0_0_40px_rgba(0,255,224,0.15)] bg-accent/10" 
            : "hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isLocked && !thought.isStreaming && (
            <div className="cursor-grab active:cursor-grabbing text-muted/20 hover:text-accent transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          {thought.isStreaming ? (
            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          ) : isWebSearch ? (
            <Globe className="w-4 h-4 text-accent" />
          ) : (
            <Sparkles className={`w-4 h-4 ${isChanged ? "text-accent" : "text-muted"}`} />
          )}
          <span className="nx-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            {thought.isStreaming ? "Streaming Intelligence" : isWebSearch ? "Protocol Action" : isChanged ? "Nexus Override" : "Neural Node"}
          </span>
          {isWebSearch && !thought.isStreaming && (
            <span className="ml-2 px-2 py-0.5 rounded-sm bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest border border-accent/20">
              Web Intelligence
            </span>
          )}
        </div>

        {!isLocked && !thought.isStreaming && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            {!isEditing && !isChanged && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent mr-2 animate-pulse flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-3 h-3" />
                <span className="hidden sm:inline">Intercept</span>
              </span>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditValue(thought.content);
                  setIsEditing(!isEditing);
                }}
                className="p-2 nx-glass-card hover:text-accent transition-all"
                title="Edit thought"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 nx-glass-card hover:text-red-400 transition-all"
                title="Remove node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div 
          className="fixed inset-0 bg-void/80 backdrop-blur-xl z-[1000] cursor-default pointer-events-auto"
          onClick={() => setIsEditing(false)}
        />
      ) : null}

      {isEditing ? (
        <div className="flex flex-col gap-4 mt-2 relative z-[1001]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <span className="nx-label text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Interception Active • Modifying Neural Sequence</span>
          </div>
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            maxLength={1000}
            placeholder="Redefine this reasoning node..."
            className="w-full nx-glass p-8 nx-font-dm text-xl outline-none min-h-[200px] resize-none shadow-2xl shadow-accent/20"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-8 py-3 nx-label text-muted hover:text-foreground transition-colors uppercase tracking-[0.2em]"
            >
              Abort Sequence
            </button>
            <button
              onClick={() => {
                onEdit(editValue);
                setIsEditing(false);
              }}
              className="px-10 py-4 bg-accent text-void font-bold rounded-sm shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center gap-3"
            >
              <Check className="w-4 h-4" />
              Commit Logic
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isChanged && diff ? (
            <div className="text-lg leading-relaxed nx-body font-medium mt-2">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.added
                      ? "text-accent font-bold bg-accent/10 px-1 rounded-sm"
                      : part.removed
                      ? "text-red-400/30 line-through decoration-red-400/20"
                      : "text-foreground/90"
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          ) : (
            <p className={`nx-body text-lg font-medium mt-2 ${isChanged ? "text-accent font-bold" : ""}`}>
              {thought.content}
            </p>
          )}
          
          {isChanged && (
            <div className="mt-4 flex items-center justify-between border-t border-accent/10 pt-4">
              <div className="flex items-center gap-2 nx-meta uppercase tracking-widest opacity-60">
                <AlertCircle className="w-3 h-3" />
                <span>Sequence Altered • ZK-Verified Override</span>
              </div>
              <span className="nx-meta tabular-nums opacity-40">
                DELTA_IDX: {Math.abs(thought.content.length - (thought.originalContent?.length || 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

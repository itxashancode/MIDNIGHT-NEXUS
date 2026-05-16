"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeTabsProps {
  /** Map of language → code string. Only the first entry is displayed. */
  codes: Record<string, string>;
  /** Primary language label shown in the tab (falls back to first key). */
  lang?: string;
  /** When true, shows a streaming / loading shimmer instead of the code. */
  isStreaming?: boolean;
}

/**
 * Lightweight code-block with a language tab and a copy button.
 * Drop-in replacement for the missing animate-ui CodeTabs component.
 */
export function CodeTabs({ codes, lang, isStreaming = false }: CodeTabsProps) {
  const [copied, setCopied] = useState(false);

  const language = lang ?? Object.keys(codes)[0] ?? "text";
  const code = codes[language] ?? codes[Object.keys(codes)[0]] ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isStreaming) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-[#0d1117] animate-pulse">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            {language}
          </span>
        </div>
        <div className="p-4 space-y-2">
          <div className="h-3 w-3/4 bg-muted/30 rounded" />
          <div className="h-3 w-1/2 bg-muted/30 rounded" />
          <div className="h-3 w-5/6 bg-muted/30 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-[#0d1117] shadow-lg">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/10">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/80">
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-subheading font-bold uppercase tracking-widest text-muted hover:text-primary border border-transparent hover:border-primary/20 transition-all"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );
}
